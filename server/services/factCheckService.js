const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// ─── Initialise Gemini ──────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Tavily Search ────────────────────────────────────────────────────────────
// mode: 'official' → restrict to credible domains only
// mode: 'global'   → search the whole web, only block forums
async function tavilySearch(query, mode = 'official') {
  const basePayload = {
    api_key: process.env.TAVILY_API_KEY,
    query,
    search_depth: 'advanced',
    include_answer: true,
    include_raw_content: false,
    max_results: 5,
  };

  const payload =
    mode === 'global'
      ? {
          ...basePayload,
          exclude_domains: ['reddit.com', 'quora.com', 'twitter.com', 'facebook.com', 'instagram.com'],
        }
      : {
          ...basePayload,
          include_domains: [
            'snopes.com', 'factcheck.org', 'politifact.com',
            'reuters.com', 'apnews.com', 'bbc.com', 'theguardian.com',
            'ndtv.com', 'thehindu.com', 'indiatoday.in', 'hindustantimes.com',
          ],
        };

  try {
    const response = await axios.post('https://api.tavily.com/search', payload, { timeout: 15000 });
    return response.data;
  } catch (error) {
    console.error('Tavily search error:', error.message);
    return { results: [], answer: '' };
  }
}

// ─── Step 1: Extract claim from text ─────────────────────────────────────────
async function extractClaimFromText(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `You are a claim extraction assistant.
Given the following text, extract the single most important factual claim that can be verified.
Return ONLY the claim as a single concise sentence. Nothing else.

TEXT:
"""
${text}
"""`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ─── Step 2: Extract claim from image ────────────────────────────────────────
async function extractClaimFromImage(imageBuffer, mimeType) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType,
    },
  };
  const prompt = `You are an advanced OCR and context understanding assistant.
Analyse this image carefully.
1. Read all visible text in the image.
2. Understand the visual context (charts, photos, screenshots, memes, etc.).
3. Extract the single most important factual claim being made (either explicitly in text or implied by the image).
Return ONLY the claim as a single concise sentence. Nothing else.`;

  const result = await model.generateContent([prompt, imagePart]);
  return result.response.text().trim();
}

// ─── Step 3: Verdict via Gemini + Tavily evidence ────────────────────────────
async function generateVerdict(claim, searchData) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Build evidence string from Tavily results
  const evidenceSummary = searchData.results
    .map(
      (r, i) =>
        `[Source ${i + 1}] "${r.title}"\nURL: ${r.url}\nSnippet: ${r.content || r.snippet || ''}`
    )
    .join('\n\n');

  const tavilyAnswer = searchData.answer
    ? `\nTavily synthesised answer: ${searchData.answer}`
    : '';

  const prompt = `You are an expert, impartial fact-checker. Your sole job is to evaluate the user's claim against the provided real-time search evidence.

CLAIM TO VERIFY:
"${claim}"

REAL-TIME SEARCH EVIDENCE:
${evidenceSummary || 'No search results found.'}
${tavilyAnswer}

--- INSTRUCTIONS ---
1. Do NOT rely on your training data. Base your verdict ONLY on the evidence provided above.
2. Do NOT guess. If the evidence is insufficient, you MUST return UNVERIFIED with a confidenceScore of exactly 0.
3. THE JOURNALISTIC STANDARD: You do NOT need a dedicated "fact-check" article to verify a claim. If the REAL-TIME SEARCH EVIDENCE contains reports from standard, credible news outlets (e.g., Reuters, AP, BBC, The Guardian, NDTV, The Hindu, etc.) describing the event in the user's claim as actually happening, you MUST classify the verdict as "REAL". Only use "UNVERIFIED" if the search results show absolutely no mention of the event, or if the only sources are forums, social media comments, or low-credibility sites.
4. Determine the verdict based on the following criteria:
   - REAL: The evidence clearly supports the claim. (Assign a high confidenceScore, e.g., 80-100).
   - FAKE: The evidence clearly debunks the claim. (Assign a high confidenceScore, e.g., 80-100).
   - MISLEADING: The claim mixes truth and fiction or strips essential context. (Assign a moderate confidenceScore, e.g., 50-80).
   - UNVERIFIED: The evidence is insufficient or absent. (The confidenceScore MUST strictly be 0).

Respond with ONLY a valid JSON object in this exact format (no markdown, no extra text):
{
  "verdict": "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED",
  "confidenceScore": <number 0-100>,
  "explanation": "<2-3 sentence explanation referencing the evidence>",
  "extractedClaim": "${claim}",
  "sources": [
    { "title": "<source title>", "url": "<source url>", "snippet": "<brief snippet>" }
  ]
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  // Strip markdown code fences if present
  const jsonString = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    return JSON.parse(jsonString);
  } catch {
    // Fallback: attempt to extract JSON via regex
    const match = jsonString.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse AI response as JSON');
  }
}

// ─── Step 2.5: Optimise claim into a short Tavily search query ───────────────
async function optimizeSearchQuery(claim) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `You are an expert search engine operator. Your job is to take a user's claim and convert it into a highly specific, 5-to-7 word search query to find relevant news articles.
Extract only the most unique keywords (location, names, specific action, unique objects).
Do NOT use full sentences or filler words.

Examples:
- Bad: "The prime minister announced today at the rally that all taxes on imported electric vehicles will be removed starting next month."
- Good: "Prime minister removes electric vehicle import tax"

USER CLAIM: ${claim}

OUTPUT ONLY THE SEARCH QUERY (5-7 words, no punctuation, no quotes):`;

  try {
    const result = await model.generateContent(prompt);
    const optimized = result.response.text().trim().replace(/["']/g, '');
    console.log(`🔎 Optimized search query: "${optimized}"`);
    return optimized;
  } catch {
    // Fallback to original claim if optimisation fails
    console.warn('⚠️  Query optimisation failed, using raw claim as fallback');
    return claim;
  }
}

// ─── Main orchestration function ─────────────────────────────────────────────
async function runFactCheck({ text, imageBuffer, mimeType, searchMode = 'official' }) {
  let claim;
  let inputType;

  if (imageBuffer) {
    inputType = 'image';
    claim = await extractClaimFromImage(imageBuffer, mimeType);
  } else {
    inputType = 'text';
    claim = await extractClaimFromText(text);
  }

  console.log(`📌 Extracted claim: ${claim}`);
  console.log(`🌐 Search mode: ${searchMode}`);

  // Optimise the claim into a short, focused search query before hitting Tavily
  const searchQuery = await optimizeSearchQuery(claim);

  // Tavily real-time search using the optimised query and selected mode
  const searchData = await tavilySearch(searchQuery, searchMode);
  console.log(`🔍 Found ${searchData.results?.length || 0} search results`);

  // Generate verdict
  const verdict = await generateVerdict(claim, searchData);

  return { inputType, claim, verdict };
}

module.exports = { runFactCheck };
