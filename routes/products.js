const express = require('express');
const { getFirestore } = require('firebase-admin/firestore');
const authenticateUser = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');

const db = getFirestore();
const productsRef = db.collection('products');
const upload = multer({ storage: multer.memoryStorage() });

// Get all products
router.get('/api/products', async (req, res) => {
    try {
      const snapshot = await productsRef.get();
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Add a new product (admin only)
router.post('/api/products', authenticateUser, upload.single('image'), async (req, res) => {
    console.log('Request body:', req.body); 
    console.log('Uploaded file:', req.file);
    const { title, description, price } = req.body;
    // console.log({ ...req.user });
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
  
    let imageUrl = null;
  
    // Handle the image upload
    if (req.file) {
      const bucket = admin.storage().bucket();
      const fileName = `products/${Date.now()}-${req.file.originalname}`; 
      const file = bucket.file(fileName);
  
      try {
        await file.save(req.file.buffer, {
          contentType: req.file.mimetype,
          resumable: false,
        });
        imageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      } catch (error) {
        console.error('Error uploading file to Firebase:', error);
        return res.status(500).send('Error uploading file');
      }
    }
  
    try {
      const newProduct = await productsRef.add({ title, description, price: parseFloat(price), imageUrl });
      res.status(201).json({ id: newProduct.id });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Update a product
router.put('/api/products/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const productData = req.body;
  
    try {
      await productsRef.doc(id).update(productData);
      res.json({ message: 'Product updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Delete a product
router.delete('/api/products/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
  
    try {
      await productsRef.doc(id).delete();
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;
