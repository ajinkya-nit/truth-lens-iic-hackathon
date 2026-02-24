const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  title: { type: String },
  url:   { type: String },
  snippet: { type: String },
});

const factCheckSchema = new mongoose.Schema(
  {
    inputType: {
      type: String,
      enum: ['text', 'image'],
      required: true,
    },
    originalInput: {
      type: String, // text content OR base64 image URL
      required: true,
    },
    extractedClaim: {
      type: String,
      required: true,
    },
    verdict: {
      type: String,
      enum: ['REAL', 'FAKE', 'MISLEADING', 'UNVERIFIED'],
      required: true,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    sources: [sourceSchema],
    imageUrl: {
      type: String, // stored Cloudinary / local URL (optional)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FactCheck', factCheckSchema);
