const dbConnection = require('../data/db');

const postController = {
    // INDEX: Ritorna la lista dei post
    index: (req, res) => {
        const sql = 'SELECT * FROM posts';

        // Esecuzione della query per recuperare tutti i post
        dbConnection.query(sql, (err, results) => {
            if (err) {
                console.error('Errore query SELECT INDEX:', err);
                return res
                    .status(500)
                    .json({ error: 'Errore del server: impossibile recuperare i post.' });
            }

            console.log(results);

            res.json(results);
        });
    },

    // SHOW: Ritorna i dettagli di un singolo post
    show: (req, res) => {
        const { id } = req.params;
        const sql = 'SELECT * FROM posts WHERE id = ?';

        // Esecuzione della query per recuperare un singolo post tramite ID
        dbConnection.query(sql, [id], (err, results) => {
            if (err) {
                console.error('Errore query SELECT SHOW:', err);
                return res.status(500).json({ error: 'Errore del server' });
            }

            if (results.length === 0) return res.status(404).json({ error: 'Post non trovato' });

            console.log(results);

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
        };

        const sql = 'INSERT INTO posts SET ?';

        // Esecuzione della query per l'inserimento di un nuovo post
        dbConnection.query(sql, newPostData, (err, result) => {
            if (err) {
                console.error('Errore query INSERT STORE:', err);
                return res.status(500).json({ error: 'Errore del server durante la creazione del post.' });
            }

            console.log(result);

            const newId = result.insertId;
            const selectSql = 'SELECT * FROM posts WHERE id = ?';

            // Esecuzione della query per recuperare i dati del post appena inserito
            dbConnection.query(selectSql, [newId], (err, selectResults) => {
                if (err) {
                    console.error('Errore query SELECT STORE:', err);
                    return res
                        .status(500)
                        .json({ error: 'Errore del server durante il recupero del post creato.' });
                }
                console.log(selectResults);

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
        };

        const sql = 'UPDATE posts SET ? WHERE id = ?';

        // Esecuzione della query per l'aggiornamento completo del post
        dbConnection.query(sql, [updatedPostData, id], (err, result) => {
            if (err) {
                console.error('Errore query UPDATE:', err);
                return res.status(500).json({ error: "Errore del server durante l'aggiornamento del post." });
            }
            console.log(result);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Post non trovato' });
            }

            const selectSql = 'SELECT * FROM posts WHERE id = ?';

            // Esecuzione della query per recuperare i dati del post appena aggiornato
            dbConnection.query(selectSql, [id], (err, selectResults) => {
                if (err) {
                    console.error('Errore query SELECT UPDATE:', err);
                    return res.status(500).json({
                        error: 'Errore del server durante il recupero del post aggiornato.',
                    });
                }
                console.log(selectResults);

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

        // Rimuoviamo il campo tags se presente, in quanto la colonna non è nel database
        if ('tags' in fieldsToUpdate) {
            delete fieldsToUpdate.tags;
        }

        const sql = 'UPDATE posts SET ? WHERE id = ?';

        // Esecuzione della query per l'aggiornamento parziale del post
        dbConnection.query(sql, [fieldsToUpdate, id], (err, result) => {
            if (err) {
                console.error('Errore query MODIFY:', err);
                return res.status(500).json({ error: 'Errore del server durante la modifica del post.' });
            }
            console.log(result);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Post non trovato' });
            }

            const selectSql = 'SELECT * FROM posts WHERE id = ?';

            // Esecuzione della query per recuperare i dati del post appena modificato
            dbConnection.query(selectSql, [id], (err, selectResults) => {
                if (err) {
                    console.error('Errore query SELECT MODIFY:', err);
                    return res.status(500).json({ error: 'Errore del server durante il recupero del post modificato.' });
                }
                console.log(selectResults);

                res.json(selectResults[0]);
            });
        });
    },

    // DESTROY: Elimina un post
    destroy: (req, res) => {
        const { id } = req.params;
        const sql = 'DELETE FROM posts WHERE id = ?';

        // Esecuzione della query per l'eliminazione del post
        dbConnection.query(sql, [id], (err, results) => {
            if (err) {
                console.error('Errore query DELETE DESTROY:', err);
                return res.status(500).json({ error: 'Errore del server' });
            }

            console.log(results);

            if (results.affectedRows === 0)
                return res.status(404).json({ error: 'Post non trovato' });

            res.sendStatus(204);
        });
    },
};

module.exports = postController;
