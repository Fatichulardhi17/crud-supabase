const express = require('express');
const router = express.Router();
const userController = require('../controlers/userControler');
const { validateUser, validateUserUpdate } = require('../middleware/validation');
// const { validateApiKey } = require('../middleware/auth'); // Aktifkan jika ingin memproteksi API dengan header x-api-key

// Route CRUD User (Dapat diakses langsung dari frontend tanpa perlu header x-api-key)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', validateUser, userController.createUser);
router.put('/:id', validateUserUpdate, userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
