const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')

const { registerUser, loginUser, updateUser, deactivateUser, getAllUsers, updateUserRole, softDeleteUser, activateUser, getUserProfile } = require('../controllers/user')
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/update-profile', upload.single('image'), updateUser)
router.get('/profile', getUserProfile);


router.get('/users',isAuthenticatedUser,authorizeRoles('admin'), getAllUsers);// for admin side
router.delete('/deactivate',isAuthenticatedUser,authorizeRoles('admin'), deactivateUser)
router.post('/activate',isAuthenticatedUser,authorizeRoles('admin'), activateUser) 
router.post('/update-role',isAuthenticatedUser,authorizeRoles('admin'), updateUserRole)
router.post('/soft-delete',isAuthenticatedUser,authorizeRoles('admin'), softDeleteUser)

module.exports = router