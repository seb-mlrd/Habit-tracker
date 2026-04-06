const router = require('express').Router();
const auth = require('../middleware/auth');
const { complete, uncomplete, history, allCompletions } = require('../controllers/completionsController');

router.use(auth);
router.get('/', allCompletions);
router.post('/:id/complete', complete);
router.delete('/:id/complete', uncomplete);
router.get('/:id/history', history);

module.exports = router;
