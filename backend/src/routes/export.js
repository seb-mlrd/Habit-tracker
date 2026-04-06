const router = require('express').Router();
const auth = require('../middleware/auth');
const { exportCSV, exportPDF } = require('../controllers/exportController');

router.use(auth);
router.get('/csv', exportCSV);
router.get('/pdf', exportPDF);

module.exports = router;
