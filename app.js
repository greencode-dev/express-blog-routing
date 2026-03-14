const express = require('express');
const app = express();
const port = 3000;
const postsRouter = require('./routers/posts');
const notFound = require('./middlewares/notFound');
const errorsHandler = require('./middlewares/errorsHandler');

// Middleware per file statici
app.use(express.static('public'));

// Body Parser
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
    console.log(`[Richiesta del ${new Date().toLocaleString()}] Query: ${req.method} ${req.url}`);
    next();
});

// Rotte principali
app.use('/posts', postsRouter);

// Middleware di chiusura
app.use(notFound);
app.use(errorsHandler);

app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});
