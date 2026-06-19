const { Router } = require('express')
const { body } = require('express-validator')
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth')
const { upload, processUploads } = require('../middlewares/upload')
const Products = require('../controllers/productController')

const router = Router()

router.get('/', Products.getProducts)
router.get('/:id', Products.getProductById)

router.post(
  '/',
  authenticateJWT,
  authorizeRoles('admin'),
  upload.array('images', 1),
  processUploads,
  [body('name').isString().notEmpty(), body('price').isFloat({ min: 0 })],
  Products.createProduct
)

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin'),
  upload.array('images', 1),
  processUploads,
  [body('name').optional().isString(), body('price').optional().isFloat({ min: 0 })],
  Products.updateProduct
)

router.delete('/:id', authenticateJWT, authorizeRoles('admin'), Products.deleteProduct)

// Upload thêm ảnh cho sản phẩm đang có
router.post(
  '/:id/images',
  authenticateJWT,
  authorizeRoles('admin'),
  upload.array('images', 5),
  processUploads,
  Products.uploadProductImages
)

module.exports = router
