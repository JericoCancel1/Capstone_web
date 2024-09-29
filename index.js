const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files (like CSS) from the "public" directory
app.use(express.static('public'));

// Serve static files (like uploaded images) from the "uploads" directory
app.use('/uploads', express.static('uploads'));

// Set up Multer (as in the previous setup)
// ... same multer code as before ...

// Home route
app.get('/', (req, res) => {
  res.render('home'); // Render home.ejs
});

// Upload page route
app.get('/upload', (req, res) => {
  res.render('upload'); // Render upload.ejs
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
