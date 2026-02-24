const express = require('express');
const router = express.Router();
const FactCheck = require('../models/FactCheck');

// GET /api/history  – most recent 20 checks (for Trending feed)
router.get('/', async (req, res) => {
  try {
    const records = await FactCheck.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('inputType extractedClaim verdict confidenceScore createdAt');
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/history/:id  – full detail for one record
router.get('/:id', async (req, res) => {
  try {
    const record = await FactCheck.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/history/:id
router.delete('/:id', async (req, res) => {
  try {
    await FactCheck.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Record deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
