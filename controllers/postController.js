const dbConnection = require('../data/db');

const postController = {
    // INDEX: Ritorna la lista dei post
    index: (req, res) => {
        const sql = 'SELECT * FROM posts';

        dbConnection.query(sql, (err, results) => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: 'Errore del server: impossibile recuperare i post.' });
            }
            res.json(results);
        });
    },

    // SHOW: Ritorna i dettagli di un singolo post
    show: (req, res) => {
        const { id } = req.params;

        const sql = 'SELECT * FROM posts WHERE id = ?';
        dbConnection.query(sql, [id], (err, results) => {
            if (err) return res.status(500).json({ error: 'Errore del server' });
            if (results.length === 0) return res.status(404).json({ error: 'Post non trovato' });
            res.json(results[0]);
        });
    },

    // STORE: Crea un nuovo post
    store: (req, res) => {
        const { title, content, image, tags } = req.body;

        // Validazione
        if (!title || title.length < 3 || !content) {
            return res.status(400).json({
                error: 'Dati non validi: titolo (min 3 car.) e contenuto sono obbligatori.',
            });
        }

        const newPostData = {
            title,
            content,
            image: image || null,
            tags: tags && Array.isArray(tags) ? tags.join(',') : null,
        };

        const sql = 'INSERT INTO posts SET ?';

        dbConnection.query(sql, newPostData, (err, result) => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: 'Errore del server durante la creazione del post.' });
            }

            const newId = result.insertId;
            const selectSql = 'SELECT * FROM posts WHERE id = ?';
            dbConnection.query(selectSql, [newId], (err, selectResults) => {
                if (err) {
                    return res
                        .status(500)
                        .json({ error: 'Errore del server durante il recupero del post creato.' });
                }
                res.status(201).json(selectResults[0]);
            });
        });
    },

    // UPDATE: Aggiorna interamente un post
    update: (req, res) => {
        const { id } = req.params;
        const { title, content, image, tags } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                error: "Dati non validi: titolo e contenuto sono obbligatori per l'aggiornamento.",
            });
        }

        const updatedPostData = {
            title,
            content,
            image: image || null,
            tags: tags && Array.isArray(tags) ? tags.join(',') : null,
        };

        const sql = 'UPDATE posts SET ? WHERE id = ?';

        dbConnection.query(sql, [updatedPostData, id], (err, result) => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: "Errore del server durante l'aggiornamento del post." });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Post non trovato' });
            }

            const selectSql = 'SELECT * FROM posts WHERE id = ?';
            dbConnection.query(selectSql, [id], (err, selectResults) => {
                if (err) {
                    return res.status(500).json({
                        error: 'Errore del server durante il recupero del post aggiornato.',
                    });
                }
                res.json(selectResults[0]);
            });
        });
    },

    // MODIFY: Aggiorna parzialmente un post
    modify: (req, res) => {
        const { id } = req.params;
        const fieldsToUpdate = { ...req.body };

        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ error: 'Nessun campo da aggiornare fornito.' });
        }

        if (fieldsToUpdate.tags && Array.isArray(fieldsToUpdate.tags)) {
            fieldsToUpdate.tags = fieldsToUpdate.tags.join(',');
        }

        const sql = 'UPDATE posts SET ? WHERE id = ?';

        dbConnection.query(sql, [fieldsToUpdate, id], (err, result) => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: 'Errore del server durante la modifica del post.' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Post non trovato' });
            }

            const selectSql = 'SELECT * FROM posts WHERE id = ?';
            dbConnection.query(selectSql, [id], (err, selectResults) => {
                if (err) {
                    return res.status(500).json({
                        error: 'Errore del server durante il recupero del post modificato.',
                    });
                }
                res.json(selectResults[0]);
            });
        });
    },

    // DESTROY: Elimina un post
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
