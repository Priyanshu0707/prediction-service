// Required dependencies
const express = require('express');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const { check, validationResult } = require('express-validator');
const cors = require('cors');

// Load environment variables from .env.public
require('dotenv').config({ path: '.env.public' });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Initialize Firebase with environment variables
const firebaseConfig = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig)
});

const db = admin.firestore();
const predictionsCollection = db.collection('predictions');
const opinionsCollection = db.collection('opinions');

// Validation middleware
const validatePrediction = [
  check('question').notEmpty().withMessage('Question is required'),
  check('category').notEmpty().withMessage('Category is required'),
  check('expiryTime').isISO8601().withMessage('Expiry time must be a valid date')
];

const validateOpinion = [
  check('predictionId').notEmpty().withMessage('Prediction ID is required'),
  check('userId').notEmpty().withMessage('User ID is required'),
  check('opinion').isIn(['Yes', 'No']).withMessage('Opinion must be either "Yes" or "No"'),
  check('amount').isNumeric().withMessage('Amount must be a number')
];

// 1. POST /prediction endpoint
app.post('/prediction', validatePrediction, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { question, category, expiryTime } = req.body;
    
    // Generate a unique ID for the prediction
    const predictionId = uuidv4();
    
    // Create the prediction document
    const predictionData = {
      id: predictionId,
      question,
      category,
      expiryTime: new Date(expiryTime),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true
    };
    
    // Save to Firebase
    await predictionsCollection.doc(predictionId).set(predictionData);
    
    // Return success response
    res.status(201).json({
      predictionId,
      message: 'Prediction created successfully'
    });
  } catch (error) {
    console.error('Error creating prediction:', error);
    res.status(500).json({ error: 'Failed to create prediction' });
  }
});

// 2. GET /predictions endpoint
app.get('/predictions', async (req, res) => {
  try {
    // Optional query parameters for filtering
    const { category } = req.query;
    
    let query = predictionsCollection.where('active', '==', true);
    
    // Apply category filter if provided
    if (category) {
      query = query.where('category', '==', category);
    }
    
    // Execute query
    const snapshot = await query.get();
    
    // Process results
    const predictions = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      predictions.push({
        id: data.id,
        question: data.question,
        category: data.category,
        expiryTime: data.expiryTime.toDate(),
        createdAt: data.createdAt && data.createdAt.toDate()
      });
    });
    
    res.status(200).json({ predictions });
  } catch (error) {
    console.error('Error retrieving predictions:', error);
    res.status(500).json({ error: 'Failed to retrieve predictions' });
  }
});

// 3. (Optional) POST /opinion endpoint
app.post('/opinion', validateOpinion, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { predictionId, userId, opinion, amount } = req.body;
    
    // Check if the prediction exists and is active
    const predictionDoc = await predictionsCollection.doc(predictionId).get();
    
    if (!predictionDoc.exists) {
      return res.status(404).json({ error: 'Prediction not found' });
    }
    
    const predictionData = predictionDoc.data();
    
    if (!predictionData.active) {
      return res.status(400).json({ error: 'This prediction is no longer active' });
    }
    
    // Check if the expiry time has passed
    const expiryTime = predictionData.expiryTime.toDate();
    if (expiryTime < new Date()) {
      return res.status(400).json({ error: 'This prediction has expired' });
    }
    
    // Check if user already submitted an opinion for this prediction
    const existingOpinion = await opinionsCollection
      .where('predictionId', '==', predictionId)
      .where('userId', '==', userId)
      .get();
    
    if (!existingOpinion.empty) {
      return res.status(400).json({ error: 'You have already submitted an opinion for this prediction' });
    }
    
    // Generate a unique ID for the opinion
    const opinionId = uuidv4();
    
    // Create the opinion document
    const opinionData = {
      id: opinionId,
      predictionId,
      userId,
      opinion,
      amount: Number(amount),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Save to Firebase
    await opinionsCollection.doc(opinionId).set(opinionData);
    
    // Return success response
    res.status(201).json({
      opinionId,
      message: 'Opinion submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting opinion:', error);
    res.status(500).json({ error: 'Failed to submit opinion' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export for testing