const express = require('express');
const router = express.Router();
const creditCardController = require('../controllers/creditCardController');

router.get('/', creditCardController.getAll);
router.get('/:id', creditCardController.getById);
router.post('/', creditCardController.create);
router.put('/:id', creditCardController.update);
router.delete('/:id', creditCardController.delete);
router.patch('/:id/toggle-active', creditCardController.toggleActive);

module.exports = router;