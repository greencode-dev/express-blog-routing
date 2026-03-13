const dbConnection = require('../data/db');
// Per le altre rotte che non sono ancora state migrate, continuiamo a usare i dati in memoria.
const posts = require('../data/posts');

const postController = {
    // INDEX con Filtro Tag (Bonus Milestone 2)
    index: (req, res) => {
        const { tag } = req.query;

        let sql = 'SELECT * FROM posts';
        const params = [];

        if (tag) {
            sql += ' WHERE tags LIKE ?';
            params.push(`%${tag}%`);
        }

        dbConnection.query(sql, params, (err, results) => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: 'Errore del server: impossibile recuperare i post.' });
            }
            res.json(results);
        });
    },

    // SHOW con controllo 404
    show: (req, res) => {
        const { id } = req.params;

        const sql = 'SELECT * FROM posts WHERE id = ?';
        dbConnection.query(sql, [id], (err, results) => {
            if (err) return res.status(500).json({ error: 'Errore del server' });
            if (results.length === 0) return res.status(404).json({ error: 'Post non trovato' });
            res.json(results[0]);
        });
    },

    // STORE con Validazione e ID più alto (Bonus Milestone 3)
    store: (req, res) => {
        const { title, content, image, tags } = req.body;

        // Validazione (Bonus)
        if (!title || title.length < 3 || !content) {
            return res.status(400).json({
                error: 'Dati non validi: titolo (min 3 car.) e contenuto sono obbligatori.',
            });
        }

        // Recupero ID più alto (Bonus)
        const maxId = posts.length > 0 ? Math.max(...posts.map((p) => p.id)) : 0;
        const newPost = { id: maxId + 1, title, content, image, tags };

        posts.push(newPost);
        res.status(201).json(newPost);
    },

    // UPDATE totale (Milestone 4)
    update: (req, res) => {
        const id = parseInt(req.params.id);
        const index = posts.findIndex((p) => p.id === id);

        if (index === -1) return res.status(404).json({ error: 'Post non trovato' });

        const { title, content, image, tags } = req.body;
        posts[index] = { id, title, content, image, tags };
        res.json(posts[index]);
    },

    // MODIFY / PATCH (Aggiornamento parziale)
    modify: (req, res) => {
        const id = parseInt(req.params.id);
        const postIndex = posts.findIndex((p) => p.id === id);

        if (postIndex === -1) {
            return res.status(404).json({ error: 'Post non trovato' });
        }

        // Creiamo un nuovo oggetto fondendo i dati vecchi con quelli nuovi (req.body)
        const updatedPost = {
            ...posts[postIndex], // Dati attuali
            ...req.body, // Sovrascrive solo le chiavi inviate nel body
        };

        // Assicuriamoci che l'ID rimanga quello originale per sicurezza
        updatedPost.id = id;

        // Aggiorniamo l'array
        posts[postIndex] = updatedPost;

        res.json(posts[postIndex]);
    },

    // DESTROY (Milestone 2)
    destroy: (req, res) => {
        const { id } = req.params;
        const sql = 'DELETE FROM posts WHERE id = ?';
        dbConnection.query(sql, [id], (err, results) => {
            if (err) return res.status(500).json({ error: 'Errore del server' });
            if (results.affectedRows === 0)
                return res.status(404).json({ error: 'Post non trovato' });
            res.sendStatus(204);
        });
    },
};

module.exports = postController;
