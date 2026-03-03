const express = require('express');
const router = express.Router();
const posts = require('../data/posts'); // Importiamo i dati creati prima

// INDEX: Lista di tutti i post
router.get('/', (req, res) => {
  // BONUS: Restituiamo la lista in formato JSON
  res.json(posts);
});

// SHOW: Singolo post tramite ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id); // Recuperiamo l'ID dall'URL e lo convertiamo in numero
  const post = posts.find((p) => p.id === id); // Cerchiamo il post nell'array

  if (post) {
    res.json(post); // Se lo troviamo, lo mandiamo come JSON
  } else {
    res.status(404).send('Post non trovato'); // Altrimenti errore 404
  }
});

// CREATE: Aggiungere un nuovo post
router.post('/', (req, res) => {
  // A. Calcolo dell'ID
  const lastPost = posts[posts.length - 1];
  const newId = lastPost ? lastPost.id + 1 : 1;

  // B. Creazione dell'oggetto
  const newPost = {
    id: newId,
    title: req.body.title,
    content: req.body.content,
    image: req.body.image,
    tags: req.body.tags,
  };

  // C. Salvataggio
  posts.push(newPost);

  // D. Risposta
  res.send(`Post aggiunto correttamente con ID ${newId}`);
  res.status(201).json(newPost);
});

// UPDATE (PUT): Sostituzione completa di un post
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id); // Prendi l'ID dall'URL
  const index = posts.findIndex((p) => p.id === id); // Cerca la posizione nell'array

  if (index !== -1) {
    // Crea il nuovo oggetto che sostituirà il vecchio
    const updatedPost = {
      id: id, // Mantieni l'ID originale
      ...req.body, // Prendi tutti i dati nuovi che arrivano da Postman
    };

    posts[index] = updatedPost; // Sostituzione effettiva nell'array
    res.json(updatedPost); // Risposta con l'oggetto aggiornato
  } else {
    res.status(404).json({ error: 'Post non trovato' });
  }
});

// UPDATE (PATCH): Aggiornamento parziale di un post
router.patch('/:id', (req, res) => {
  res.send(`Aggiornamento parziale del post ${req.params.id}`);
});

// DELETE: Cancellazione di un post
router.delete('/:id', (req, res) => {
  res.send(`Cancellazione del post ${req.params.id}`);
});

module.exports = router; // Esportiamo il router per usarlo in app.js
