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
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        console.log('MongoDB URI:', process.env.MONGODB_URI); // This will help debug connection issues
    });

// Basic error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!', error: err.message });
});

// Routes
const productRoutes = require('./routes/products');
const uploadRoutes = require('./routes/upload');

app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Ceramics Website API' });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend server is running!' });
});

// Catch-all route for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
}); 