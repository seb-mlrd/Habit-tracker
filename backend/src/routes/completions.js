const router = require('express').Router();
const auth = require('../middleware/auth');
const { complete, uncomplete, history, allCompletions } = require('../controllers/completionsController');

router.use(auth);

/**
 * @openapi
 * /completions:
 *   get:
 *     summary: Get all completions for the authenticated user
 *     tags: [Completions]
 *     responses:
 *       200:
 *         description: Array of completions with habit name
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Completion' }
 */
router.get('/', allCompletions);

/**
 * @openapi
 * /completions/{id}/complete:
 *   post:
 *     summary: Mark a habit as complete for a given date
 *     tags: [Completions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date: { type: string, format: date, description: "Defaults to today" }
 *     responses:
 *       201:
 *         description: Completion recorded
 *       409:
 *         description: Already completed for this date
 */
router.post('/:id/complete', complete);

/**
 * @openapi
 * /completions/{id}/complete:
 *   delete:
 *     summary: Unmark a habit completion
 *     tags: [Completions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *     responses:
 *       204:
 *         description: Completion removed
 */
router.delete('/:id/complete', uncomplete);

/**
 * @openapi
 * /completions/{id}/history:
 *   get:
 *     summary: Get completion history for a specific habit
 *     tags: [Completions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Array of completions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Completion' }
 */
router.get('/:id/history', history);

module.exports = router;
