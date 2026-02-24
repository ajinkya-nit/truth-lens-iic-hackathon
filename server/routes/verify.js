const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const FactCheck = require('../models/FactCheck');
const { runFactCheck } = require('../services/factCheckService');

// POST /api/verify
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    const imageFile = req.file;

    if (!text && !imageFile) {
      return res.status(400).json({ success: false, message: 'Please provide text or an image.' });
    }

    let originalInput;
    let imageBuffer = null;
    let mimeType = null;

    if (imageFile) {
      imageBuffer = imageFile.buffer;
      mimeType = imageFile.mimetype;
      originalInput = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    } else {
      originalInput = text;
    }

    // Run the full fact-check pipeline
    const { inputType, claim, verdict } = await runFactCheck({
      text: imageFile ? null : text,
      imageBuffer,
      mimeType,
    });

    // Persist result to MongoDB
    const factCheck = await FactCheck.create({
      inputType,
      originalInput: imageFile ? `[Image uploaded - ${imageFile.originalname}]` : originalInput,
      extractedClaim: claim,
      verdict: verdict.verdict,
      confidenceScore: verdict.confidenceScore,
      explanation: verdict.explanation,
      sources: verdict.sources || [],
    });

    res.status(200).json({
      success: true,
      data: {
        id: factCheck._id,
        inputType,
        extractedClaim: claim,
        verdict: verdict.verdict,
        confidenceScore: verdict.confidenceScore,
        explanation: verdict.explanation,
        sources: verdict.sources || [],
        createdAt: factCheck.createdAt,
      },
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, message: error.message || 'Verification failed.' });
  }
});

module.exports = router;
