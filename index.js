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

// Set up multer storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload variable with multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1 MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('image'); // 'image' is the name of the form field

// Function to check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Home route
app.get('/', (req, res) => {
  res.render('home'); // Render home.ejs
});

// Upload page route
app.get('/upload', (req, res) => {
  res.render('upload'); // Render upload.ejs
});

// Handle file upload
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    // Log the request body and file for debugging
    console.log(req.body);
    console.log(req.file);

    if (err) {
      return res.send(`Error: ${err}`);
    }
    if (req.file == undefined) {
      return res.send('Error: No File Selected!');
    }
    res.send(`File Uploaded: <a href="/uploads/${req.file.filename}">View File</a>`);
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
