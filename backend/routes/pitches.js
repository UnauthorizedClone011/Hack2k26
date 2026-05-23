const express = require('express');
const router = express.Router();
const Pitch = require('../models/Pitch');
const Job = require('../models/Job');

// POST /api/pitches - create pitch
router.post('/', async (req, res) => {
  try {
    const job = await Job.findById(req.body.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const pitch = new Pitch(req.body);
    const savedPitch = await pitch.save();
    res.status(201).json(savedPitch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/pitches/job/:jobId - get all pitches for a job
router.get('/job/:jobId', async (req, res) => {
  try {
    const pitches = await Pitch.find({ jobId: req.params.jobId }).sort({
      createdAt: -1,
    });
    res.json(pitches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/pitches/:id/accept - accept pitch, reject others
router.patch('/:id/accept', async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.id);
    if (!pitch) {
      return res.status(404).json({ message: 'Pitch not found' });
    }

    pitch.status = 'Accepted';
    await pitch.save();

    await Pitch.updateMany(
      { jobId: pitch.jobId, _id: { $ne: pitch._id } },
      { status: 'Rejected' }
    );

    await Job.findByIdAndUpdate(pitch.jobId, { status: 'In Progress' });

    const allPitches = await Pitch.find({ jobId: pitch.jobId }).sort({
      createdAt: -1,
    });

    res.json({
      message: 'Pitch accepted. Other pitches rejected.',
      acceptedPitch: pitch,
      pitches: allPitches,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
