const express = require('express');
const router = express.Router();
const { login, getStaffAccounts } = require('../controllers/authController');

router.post('/login', login);
router.get('/accounts', getStaffAccounts);

module.exports = router;

