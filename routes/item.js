const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')

const { getAllItems,
    getSingleItem,
    createItem,
    updateItem,
    deleteItem, } = require('../controllers/item')
const {isAuthenticatedUser} = require('../middlewares/auth')

router.get('/items', getAllItems);
router.get('/items', isAuthenticatedUser,  getAllItems)
router.get('/items/:id', getSingleItem)


router.post('/items', isAuthenticatedUser, upload.array('image', 10), createItem);
router.put('/items/:id', isAuthenticatedUser, upload.array('image', 10), updateItem);
router.delete('/items/:id', isAuthenticatedUser, deleteItem)
module.exports = router;