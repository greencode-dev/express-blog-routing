const express = require('express');
const app = express();
const port = 3000;
const postsRouter = require('./routers/posts'); // Importiamo il router

// Middleware per il parsing del JSON nei body delle richieste
app.use(express.json());

// Importante: definiamo il prefisso '/posts' per tutte le rotte del router
app.use('/posts', postsRouter);

app.get('/', (req, res) => {
  res.send('Server del mio Blog funzionante!');
});

app.listen(port, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});
