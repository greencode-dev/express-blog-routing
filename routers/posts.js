const express = require('express');
const router = express.Router();
const postControllerPromise = require('../controllers/postControllerPromise');
const postController = require('../controllers/postController');

// Rotte per il nuovo controller CRUD (con Promise via then/catch)
router.get('/promise/', postControllerPromise.index);
router.get('/promise/:id', postControllerPromise.show);
router.post('/promise/', postControllerPromise.store);
router.put('/promise/:id', postControllerPromise.update);
router.patch('/promise/:id', postControllerPromise.modify);
router.delete('/promise/:id', postControllerPromise.destroy);

// Rotte per il controller CRUD classico (con Callback)
// (vengono dichiarate per ultime in quanto contengono i parametri dinamici /:id che potrebbero cannibalizzare le stringhe statiche precedenti)
router.get('/', postController.index);
router.get('/:id', postController.show);
router.post('/', postController.store);
router.put('/:id', postController.update);
router.patch('/:id', postController.modify);
router.delete('/:id', postController.destroy);

module.exports = router;
