const multer = require('multer')
const { Readable } = require('stream')
const cloudinary = require('../lib/cloudinary')

// Dùng memory storage — file không lưu vào disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

/**
 * Upload 1 buffer lên Cloudinary, trả về secure_url
 * @param {Buffer} buffer
 * @param {string} folder - thư mục trên Cloudinary
 * @returns {Promise<string>} URL ảnh
 */
async function uploadBuffer(buffer, folder = 'products') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (err, result) => {
        if (err) reject(err)
        else resolve(result.secure_url)
      }
    )
    Readable.from(buffer).pipe(stream)
  })
}

/**
 * Middleware: sau khi multer xử lý req.files,
 * upload tất cả lên Cloudinary và gán req.cloudinaryUrls = ['https://...']
 */
async function processUploads(req, res, next) {
  if (!req.files || req.files.length === 0) return next()
  try {
    req.cloudinaryUrls = await Promise.all(
      req.files.map((f) => uploadBuffer(f.buffer))
    )
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { upload, uploadBuffer, processUploads }
