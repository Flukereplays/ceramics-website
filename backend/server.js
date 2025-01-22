const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*'  // During development, accept all origins
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Ceramics Website API' });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend server is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 