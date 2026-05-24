const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { fieldName, fieldValue } = req.body;

  if (!fieldValue || !fieldValue.trim()) {
    return res.status(400).json({ message: 'fieldValue is required' });
  }

  if (!['intro', 'whyMe'].includes(fieldName)) {
    return res.status(400).json({ message: 'fieldName must be intro or whyMe' });
  }

  try {
    const text = fieldValue.trim();
    const cleaned = text
      .replace(/\bi\b/g, 'I')
      .replace(/\bim\b/gi, "I'm")
      .replace(/\bdont\b/gi, "don't")
      .replace(/\bcant\b/gi, "can't")
      .replace(/\bwont\b/gi, "won't")
      .replace(/\biam\b/gi, 'I am')
      .replace(/\s+/g, ' ')
      .trim();

    let enhancedText = '';

    if (fieldName === 'intro') {
      enhancedText = `${cleaned}

As a dedicated and skilled professional, I bring hands‑on experience and a results‑driven approach to every project. I am committed to delivering exceptional quality within deadlines, ensuring your business goals are met with precision and creativity.`;
    } else {
      enhancedText = `${cleaned}

I have a proven track record of delivering similar projects with outstanding results. My technical expertise, attention to detail, and proactive communication style make me uniquely qualified for this opportunity. I am confident in exceeding your expectations within the agreed timeline and budget, and I am fully committed to making this collaboration a success.`;
    }

    // Fallback: if somehow empty, just return cleaned text
    if (!enhancedText.trim()) {
      enhancedText = cleaned || "Your text has been improved.";
    }

    return res.json({ enhancedText: enhancedText.trim() });

  } catch (err) {
    console.error('Enhance error:', err.message);
    return res.status(500).json({ message: 'Enhancement failed' });
  }
});

module.exports = router;
