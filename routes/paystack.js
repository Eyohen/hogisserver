const express = require('express');
const { verifyTransaction } = require('../controller/paystack');

const router = express.Router();

router.post('/verify', verifyTransaction);

module.exports = router;
