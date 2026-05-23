process.env.NODE_OPTIONS = '--dns-result-order=ipv4first';

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
  directConnection: false,
  retryWrites: true
})
.then(() => console.log('✅ MongoDB Connected Successfully!'))
.catch(err => console.log('❌ MongoDB Error:', err.message));

app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/students', require('./routes/students'));
app.use('/api/pitches', require('./routes/pitches'));

app.get('/', (req, res) => {
  res.send('I-COCKROACH API Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 I-COCKROACH Server Running on Port ${PORT}`)
);
