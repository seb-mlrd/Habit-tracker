const router = require('express').Router();
const auth = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/usersController');

router.use(auth);
router.get('/me', getSettings);
router.put('/me', updateSettings);

module.exports = router;
