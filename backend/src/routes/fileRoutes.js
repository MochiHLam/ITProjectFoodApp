const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateJWT } = require('../middlewares/auth');

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/upload', authenticateJWT, upload.single('file'), (req, res) => {
  res.status(201).json({ path: `/uploads/${req.file.filename}` });
});

router.get('/download', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ message: 'path is required' });
  const absolute = path.join(__dirname, '..', filePath.replace(/^\/+/, ''));
  if (!fs.existsSync(absolute)) return res.status(404).json({ message: 'Not Found' });
  res.download(absolute);
});

module.exports = router;



