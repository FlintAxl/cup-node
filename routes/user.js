const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')

const { registerUser, loginUser, updateUser, deactivateUser, getAllUsers, updateUserRole, softDeleteUser, activateUser, getUserProfile } = require('../controllers/user')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/update-profile', upload.single('image'), updateUser)
router.get('/profile', getUserProfile);


router.get('/users', getAllUsers);// for admin side
router.delete('/deactivate', deactivateUser)
router.post('/activate', activateUser) 
router.post('/update-role', updateUserRole)
router.post('/soft-delete', softDeleteUser)

module.exports = router