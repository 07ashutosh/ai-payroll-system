const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'aiRoutes - GET all' }));
router.post('/', (req, res) => res.json({ message: 'aiRoutes - POST' }));

module.exports = router;
