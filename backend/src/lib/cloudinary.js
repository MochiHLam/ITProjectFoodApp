const { v2: cloudinary } = require('cloudinary')

// Lazy config: đọc env tại thời điểm gọi, đảm bảo dotenv đã load xong
function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
  return cloudinary
}

module.exports = getCloudinary()
