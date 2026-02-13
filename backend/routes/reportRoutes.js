const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'reportRoutes - GET all' }));
router.post('/', (req, res) => res.json({ message: 'reportRoutes - POST' }));

module.exports = router;
