const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// ─── Initialise Gemini ──────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Tavily Search ────────────────────────────────────────────────────────────
async function tavilySearch(query) {
  try {
    const response = await axios.post(
      'https://api.tavily.com/search',
      {
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'advanced',
        include_answer: true,
        include_raw_content: false,
        max_results: 5,
        include_domains: [
          'snopes.com',
          'factcheck.org',
          'politifact.com',
          'reuters.com',
          'apnews.com',
          'bbc.com',
          'theguardian.com',
        ],
      },
      { timeout: 15000 }
    );
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

RULES:
- Do NOT rely on your training data. Base your verdict ONLY on the evidence provided above.
- If the evidence clearly supports the claim → REAL
- If the evidence clearly contradicts the claim → FAKE
- If the evidence partially supports it or context is distorted → MISLEADING
- If there is insufficient evidence to make a judgement → UNVERIFIED
- Confidence score: 0–100 (how confident you are in the verdict based solely on the evidence).

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

// ─── Main orchestration function ─────────────────────────────────────────────
async function runFactCheck({ text, imageBuffer, mimeType }) {
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

  // Tavily real-time search
  const searchData = await tavilySearch(claim);
  console.log(`🔍 Found ${searchData.results?.length || 0} search results`);

  // Generate verdict
  const verdict = await generateVerdict(claim, searchData);

  return { inputType, claim, verdict };
}

module.exports = { runFactCheck };
