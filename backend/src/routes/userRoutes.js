const { Router } = require('express');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth');
const Users = require('../controllers/userController');

const router = Router();

// All user management routes require admin role
router.get('/', authenticateJWT, authorizeRoles('admin'), Users.getAllUsers);
router.get('/:id', authenticateJWT, authorizeRoles('admin'), Users.getUserById);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), Users.updateUser);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), Users.deleteUser);

module.exports = router;
