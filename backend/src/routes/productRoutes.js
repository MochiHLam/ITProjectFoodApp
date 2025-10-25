const { Router } = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth');
const Products = require('../controllers/productController');

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.get('/', Products.getProducts);
router.get('/:id', Products.getProductById);

router.post(
  '/',
  authenticateJWT,
  authorizeRoles('admin'),
  upload.array('images', 5),
  [body('name').isString().notEmpty(), body('price').isFloat({ min: 0 })],
  Products.createProduct
);

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin'),
   upload.array('images', 5),
  [body('name').optional().isString(), body('price').optional().isFloat({ min: 0 })],
  Products.updateProduct
);

router.delete('/:id', authenticateJWT, authorizeRoles('admin'), Products.deleteProduct);

// Upload additional images to existing product
router.post(
  '/:id/images',
  authenticateJWT,
  authorizeRoles('admin'),
  upload.array('images', 5),
  Products.uploadProductImages
);

module.exports = router;



