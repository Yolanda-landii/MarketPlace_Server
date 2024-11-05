const express = require('express');
const { getFirestore } = require('firebase-admin/firestore');
const authenticateUser = require('../middleware/auth');
const router = express.Router();

const db = getFirestore();

// Get user cart
router.get('/', authenticateUser, async (req, res) => {
  try {
    const cartRef = db.collection('carts').doc(req.user.uid);
    const cartDoc = await cartRef.get();
    if (!cartDoc.exists) return res.json({ items: [] });
    res.json(cartDoc.data());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add item to cart
router.post('/', authenticateUser, async (req, res) => {
  const { productId, quantity } = req.body;
  
  try {
    const cartRef = db.collection('carts').doc(req.user.uid);
    await cartRef.set(
      { items: admin.firestore.FieldValue.arrayUnion({ productId, quantity }) },
      { merge: true }
    );
    res.json({ message: 'Item added to cart' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Checkout (simple version)
router.post('/checkout', authenticateUser, async (req, res) => {
  try {
    const cartRef = db.collection('carts').doc(req.user.uid);
    await cartRef.delete(); 
    res.json({ message: 'Checkout successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
