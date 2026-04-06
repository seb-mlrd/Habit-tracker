const router = require('express').Router();
const auth = require('../middleware/auth');
const { list, create, update, remove } = require('../controllers/habitsController');

router.use(auth);

/**
 * @openapi
 * /habits:
 *   get:
 *     summary: List all habits for the authenticated user
 *     tags: [Habits]
 *     responses:
 *       200:
 *         description: Array of habits with streak
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Habit' }
 */
router.get('/', list);

/**
 * @openapi
 * /habits:
 *   post:
 *     summary: Create a new habit
 *     tags: [Habits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               frequency: { type: string, enum: [daily, weekly], default: daily }
 *               category: { type: string, enum: [health, sport, productivity, learning, social, other], default: other }
 *     responses:
 *       201:
 *         description: Created habit
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Habit' }
 */
router.post('/', create);

/**
 * @openapi
 * /habits/{id}:
 *   put:
 *     summary: Update a habit
 *     tags: [Habits]
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
 *               name: { type: string }
 *               description: { type: string }
 *               frequency: { type: string }
 *               category: { type: string }
 *     responses:
 *       200:
 *         description: Updated habit
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Habit' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/:id', update);

/**
 * @openapi
 * /habits/{id}:
 *   delete:
 *     summary: Delete a habit
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', remove);

module.exports = router;
