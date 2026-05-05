const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { searchUsers } = require('../controllers/userController');

router.use(protect);
router.get('/search', searchUsers);

module.exports = router;
