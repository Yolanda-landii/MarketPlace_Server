const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { email, password, name, isAdmin } = req.body;
  
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
  
      // Set custom claims if the user is an admin
      if (isAdmin) {
        await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
      }
  
      res.status(201).json({ uid: userRecord.uid });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });


// Login user and return a JWT
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      const customToken = await admin.auth().createCustomToken(userRecord.uid);
  
      console.log("Generated custom token for user:", userRecord.uid);
  
      res.status(200).json({
        customToken,
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  

// Check if the user is an admin
router.get('/checkAdmin', async (req, res) => {
    const idToken = req.headers.authorization?.split(' ')[1];
  
    if (!idToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const isAdmin = decodedToken.admin || false; 
      res.status(200).json({ isAdmin });
    } catch (error) {
      console.error('Token verification error:', error.message);
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  
module.exports = router;
