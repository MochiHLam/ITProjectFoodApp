const { Router } = require('express')
const { authenticateJWT } = require('../middlewares/auth')
const { upload, uploadBuffer } = require('../middlewares/upload')

const router = Router()

// Upload 1 file → trả về Cloudinary URL
router.post('/upload', authenticateJWT, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const url = await uploadBuffer(req.file.buffer)
    res.status(201).json({ path: url })
  } catch (err) {
    next(err)
  }
})

module.exports = router
