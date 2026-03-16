// Importiamo il modulo db per interagire col database
const dbConnection = require('../data/db');
const util = require('util');

// Helper: recupera un post con i relativi tag e risponde al client
function fetchPostWithTags(id, res, status = 200) {
    const selectSql = 'SELECT * FROM posts WHERE id = ?';

    dbConnection.query(selectSql, [id], (err, results) => {
        if (err) {
            console.error('Errore query SELECT post:', err);
            return res.status(500).json({ error: 'Errore del server nel recupero del post.' });
        }

        if (results.length === 0) return res.status(404).json({ error: 'Post non trovato' });

        const post = results[0];
        const tagSql = `
            SELECT tags.* FROM tags
            JOIN post_tag ON tags.id = post_tag.tag_id
            WHERE post_tag.post_id = ?
        `;

        dbConnection.query(tagSql, [id], (err, tagResults) => {
            if (err) {
                console.error('Errore query SELECT tags:', err);
                return res.status(500).json({ error: 'Errore del server nel recupero dei tag.' });
            }

            post.tags = tagResults;
            console.log(post);
            res.status(status).json(post);
        });
    });
}

const postController = {
    // INDEX: Ritorna la lista dei post (con filtro opzionale per tag)
    index: (req, res) => {
        const { tags: tagFilter } = req.query;

        // Se è presente il filtro ?tags=id, filtriamo i post per quel tag
        let sql, params;
        if (tagFilter) {
            sql = `
                SELECT DISTINCT posts.* FROM posts
                JOIN post_tag ON posts.id = post_tag.post_id
                WHERE post_tag.tag_id = ?
            `;
            params = [tagFilter];
        } else {
            sql = 'SELECT * FROM posts';
            params = [];
        }

        // Prima query: recupera i post (tutti o filtrati)
        dbConnection.query(sql, params, (err, posts) => {
            if (err) {
                console.error('Errore query SELECT INDEX:', err);
                return res.status(500).json({ error: 'Errore del server: impossibile recuperare i post.' });
            }

            if (posts.length === 0) return res.json([]);

            // Seconda query: recupera tutti i tag con il loro post_id in un colpo solo
            const tagSql = `
                SELECT post_tag.post_id, tags.*
                FROM tags
                JOIN post_tag ON tags.id = post_tag.tag_id
            `;

            dbConnection.query(tagSql, (err, tagRows) => {
                if (err) {
                    console.error('Errore query SELECT TAGS INDEX:', err);
                    return res.status(500).json({ error: 'Errore del server nel recupero dei tag.' });
                }

                // Raggruppiamo i tag per post_id
                const tagsByPostId = {};
                tagRows.forEach(row => {
                    const { post_id, ...tag } = row;
                    if (!tagsByPostId[post_id]) tagsByPostId[post_id] = [];
                    tagsByPostId[post_id].push(tag);
                });

                // Aggiungiamo i tag a ciascun post
                const postsWithTags = posts.map(post => ({
                    ...post,
                    tags: tagsByPostId[post.id] || [],
                }));

                console.log(util.inspect(postsWithTags, { depth: null, colors: true }));
                res.json(postsWithTags);
            });
        });
    },

    // SHOW: Ritorna i dettagli di un singolo post (con tags aggregati)
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

            const post = results[0];

            // Query per recuperare i tag associati al post tramite la tabella pivot
            const tagSql = `
                SELECT tags.* FROM tags
                JOIN post_tag ON tags.id = post_tag.tag_id
                WHERE post_tag.post_id = ?
            `;

            dbConnection.query(tagSql, [id], (err, tagResults) => {
                if (err) {
                    console.error('Errore query SELECT TAGS:', err);
                    return res.status(500).json({ error: 'Errore del server nel recupero dei tag' });
                }

                post.tags = tagResults;
                console.log(post);

                res.json(post);
            });
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

            const newId = result.insertId;

            // Se ci sono tag da associare, li inseriamo nella tabella pivot
            if (tags && tags.length > 0) {
                const tagValues = tags.map(tagId => [newId, tagId]);
                const tagSql = 'INSERT INTO post_tag (post_id, tag_id) VALUES ?';

                dbConnection.query(tagSql, [tagValues], (err) => {
                    if (err) {
                        console.error('Errore query INSERT TAGS STORE:', err);
                        return res.status(500).json({ error: 'Errore del server durante l\'associazione dei tag.' });
                    }

                    fetchPostWithTags(newId, res, 201);
                });
            } else {
                fetchPostWithTags(newId, res, 201);
            }
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

        // Aggiorniamo i campi del post
        dbConnection.query(sql, [updatedPostData, id], (err, result) => {
            if (err) {
                console.error('Errore query UPDATE:', err);
                return res.status(500).json({ error: "Errore del server durante l'aggiornamento del post." });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Post non trovato' });
            }

            // Cancelliamo tutti i tag esistenti dalla pivot
            dbConnection.query('DELETE FROM post_tag WHERE post_id = ?', [id], (err) => {
                if (err) {
                    console.error('Errore query DELETE TAGS UPDATE:', err);
                    return res.status(500).json({ error: 'Errore del server durante la cancellazione dei tag.' });
                }

                // Se ci sono nuovi tag, li inseriamo nella pivot
                if (tags && tags.length > 0) {
                    const tagValues = tags.map(tagId => [id, tagId]);
                    dbConnection.query('INSERT INTO post_tag (post_id, tag_id) VALUES ?', [tagValues], (err) => {
                        if (err) {
                            console.error('Errore query INSERT TAGS UPDATE:', err);
                            return res.status(500).json({ error: 'Errore del server durante l\'inserimento dei tag.' });
                        }
                        fetchPostWithTags(id, res);
                    });
                } else {
                    fetchPostWithTags(id, res);
                }
            });
        });
    },

    // MODIFY: Aggiorna parzialmente un post
    modify: (req, res) => {
        const { id } = req.params;
        const { tags, ...fieldsToUpdate } = req.body; // Separiamo tags dagli altri campi

        if (Object.keys(fieldsToUpdate).length === 0 && tags === undefined) {
            return res.status(400).json({ error: 'Nessun campo da aggiornare fornito.' });
        }

        // Funzione che gestisce l'aggiornamento dei tag (se forniti) e risponde
        const handleTagsAndRespond = () => {
            if (tags !== undefined) {
                // Cancelliamo i tag esistenti e reinserisco quelli nuovi
                dbConnection.query('DELETE FROM post_tag WHERE post_id = ?', [id], (err) => {
                    if (err) {
                        console.error('Errore query DELETE TAGS MODIFY:', err);
                        return res.status(500).json({ error: 'Errore del server durante la cancellazione dei tag.' });
                    }

                    if (tags.length > 0) {
                        const tagValues = tags.map(tagId => [id, tagId]);
                        dbConnection.query('INSERT INTO post_tag (post_id, tag_id) VALUES ?', [tagValues], (err) => {
                            if (err) {
                                console.error('Errore query INSERT TAGS MODIFY:', err);
                                return res.status(500).json({ error: 'Errore del server durante l\'inserimento dei tag.' });
                            }
                            fetchPostWithTags(id, res);
                        });
                    } else {
                        fetchPostWithTags(id, res);
                    }
                });
            } else {
                fetchPostWithTags(id, res);
            }
        };

        // Se non ci sono campi del post da aggiornare (solo tags), saltiamo la UPDATE
        if (Object.keys(fieldsToUpdate).length === 0) {
            // Controlliamo che il post esista prima di aggiornare i tag
            dbConnection.query('SELECT id FROM posts WHERE id = ?', [id], (err, results) => {
                if (err) return res.status(500).json({ error: 'Errore del server.' });
                if (results.length === 0) return res.status(404).json({ error: 'Post non trovato' });
                handleTagsAndRespond();
            });
            return;
        }

        const sql = 'UPDATE posts SET ? WHERE id = ?';

        // Aggiorniamo i campi del post
        dbConnection.query(sql, [fieldsToUpdate, id], (err, result) => {
            if (err) {
                console.error('Errore query MODIFY:', err);
                return res.status(500).json({ error: 'Errore del server durante la modifica del post.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Post non trovato' });
            }

            handleTagsAndRespond();
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
