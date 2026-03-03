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
  const id = parseInt(req.params.id); // Trasformiamo l'ID dell'URL in numero
  const post = posts.find((p) => p.id === id); // Cerchiamo l'oggetto originale

  if (post) {
    // Se il campo 'title' è presente nel body inviato da Postman, sovrascrivi quello originale
    if (req.body.title) post.title = req.body.title;

    // Se 'content' è presente, sovrascrivilo, altrimenti non fare nulla
    if (req.body.content) post.content = req.body.content;

    if (req.body.image) post.image = req.body.image;
    if (req.body.tags) post.tags = req.body.tags;

    res.json(post); // Rispondi con il post aggiornato
  } else {
    res.status(404).json({ error: 'Post non trovato' });
  }
});

// DELETE: Cancellazione di un post
router.delete('/:id', (req, res) => {
  // A. Trasformiamo l'ID dell'URL in un numero
  const id = parseInt(req.params.id);

  // B. Cerchiamo la posizione (indice) del post nell'array
  const index = posts.findIndex((p) => p.id === id);

  if (index !== -1) {
    // C. Rimuoviamo l'elemento dall'array usando splice
    posts.splice(index, 1);

    // D. Risposta di successo (204 No Content)
    res.sendStatus(204);
  } else {
    // E. Gestione dell'errore se l'ID non esiste
    res.status(404).json({ error: 'Post da eliminare non trovato' });
  }
});

module.exports = router; // Esportiamo il router per usarlo in app.js
