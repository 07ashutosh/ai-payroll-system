const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'departmentRoutes - GET all' }));
router.post('/', (req, res) => res.json({ message: 'departmentRoutes - POST' }));

module.exports = router;
