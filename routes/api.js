const express = require('express');
const proxyController = require('../controllers/proxyController');

const router = express.Router();

router.use('/api/*', proxyController.handleProxyRequest);

module.exports = router;
