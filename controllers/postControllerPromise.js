const dbConnectionPromise = require('../data/dbPromise');

const postControllerPromise = {
    // INDEX: Ritorna la lista dei post
    index: (req, res) => {
        const sql = 'SELECT * FROM posts';

        // Esecuzione della query per recuperare tutti i post
        dbConnectionPromise.query(sql)
            .then(([results]) => {
                console.log(results);
                res.json(results);
            })
            .catch((err) => {
                console.error('Errore query SELECT INDEX:', err);
                return res.status(500).json({ error: 'Errore del server: impossibile recuperare i post.' });
            });
    },

    // SHOW: Ritorna i dettagli di un singolo post
    show: (req, res) => {
        const { id } = req.params;
        const sql = 'SELECT * FROM posts WHERE id = ?';

        // Esecuzione della query per recuperare un singolo post tramite ID
        dbConnectionPromise.query(sql, [id])
            .then(([results]) => {
                if (results.length === 0) return res.status(404).json({ error: 'Post non trovato' });

                console.log(results);
                res.json(results[0]);
            })
            .catch((err) => {
                console.error('Errore query SELECT SHOW:', err);
                return res.status(500).json({ error: 'Errore del server' });
            });
    },

    // STORE: Crea un nuovo post
    store: (req, res) => {
        const { title, content, image } = req.body;

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
        dbConnectionPromise.query(sql, newPostData)
            .then(([result]) => {
                console.log(result);

                const newId = result.insertId;
                const selectSql = 'SELECT * FROM posts WHERE id = ?';

                // Esecuzione della query per recuperare i dati del post appena inserito
                return dbConnectionPromise.query(selectSql, [newId]);
            })
            .then(([selectResults]) => {
                console.log(selectResults);
                res.status(201).json(selectResults[0]);
            })
            .catch((err) => {
                console.error('Errore query INSERT STORE:', err);
                return res.status(500).json({ error: 'Errore del server durante la creazione del post.' });
            });
    },

    // UPDATE: Aggiorna interamente un post
    update: (req, res) => {
        const { id } = req.params;
        const { title, content, image } = req.body;

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
        dbConnectionPromise.query(sql, [updatedPostData, id])
            .then(([result]) => {
                console.log(result);

                if (result.affectedRows === 0) {
                    res.status(404).json({ error: 'Post non trovato' });
                    // Solleviamo un'eccezione custom per saltare il blocco then successivo
                    throw new Error('NOT_FOUND');
                }

                const selectSql = 'SELECT * FROM posts WHERE id = ?';

                // Esecuzione della query per recuperare i dati del post appena aggiornato
                return dbConnectionPromise.query(selectSql, [id]);
            })
            .then(([selectResults]) => {
                console.log(selectResults);
                res.json(selectResults[0]);
            })
            .catch((err) => {
                if (err.message === 'NOT_FOUND') return; // Gestito nel then

                console.error('Errore query UPDATE:', err);
                return res.status(500).json({ error: "Errore del server durante l'aggiornamento del post." });
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
        dbConnectionPromise.query(sql, [fieldsToUpdate, id])
            .then(([result]) => {
                console.log(result);

                if (result.affectedRows === 0) {
                    res.status(404).json({ error: 'Post non trovato' });
                    // Solleviamo un'eccezione custom per saltare il blocco then successivo
                    throw new Error('NOT_FOUND');
                }

                const selectSql = 'SELECT * FROM posts WHERE id = ?';

                // Esecuzione della query per recuperare i dati del post appena modificato
                return dbConnectionPromise.query(selectSql, [id]);
            })
            .then(([selectResults]) => {
                console.log(selectResults);
                res.json(selectResults[0]);
            })
            .catch((err) => {
                if (err.message === 'NOT_FOUND') return; // Gestito nel then

                console.error('Errore query MODIFY:', err);
                return res.status(500).json({ error: 'Errore del server durante la modifica del post.' });
            });
    },

    // DESTROY: Elimina un post
    destroy: (req, res) => {
        const { id } = req.params;
        const sql = 'DELETE FROM posts WHERE id = ?';

        // Esecuzione della query per l'eliminazione del post
        dbConnectionPromise.query(sql, [id])
            .then(([results]) => {
                console.log(results);

                if (results.affectedRows === 0)
                    return res.status(404).json({ error: 'Post non trovato' });

                res.sendStatus(204);
            })
            .catch((err) => {
                console.error('Errore query DELETE DESTROY:', err);
                return res.status(500).json({ error: 'Errore del server' });
            });
    },
};

module.exports = postControllerPromise;
