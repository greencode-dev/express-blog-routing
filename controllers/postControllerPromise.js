// Importiamo il modulo dbPromise per interagire col database
const dbConnectionPromise = require('../data/dbPromise');
const util = require('util');

// Helper: recupera un post con i relativi tag e risponde al client
function fetchPostWithTagsPromise(id, res, status = 200) {
    const selectSql = 'SELECT * FROM posts WHERE id = ?';
    const tagSql = `
        SELECT tags.* FROM tags
        JOIN post_tag ON tags.id = post_tag.tag_id
        WHERE post_tag.post_id = ?
    `;

    return dbConnectionPromise.query(selectSql, [id])
        .then(([results]) => {
            if (results.length === 0) {
                res.status(404).json({ error: 'Post non trovato' });
                throw new Error('NOT_FOUND');
            }

            const post = results[0];

            return dbConnectionPromise.query(tagSql, [id])
                .then(([tagResults]) => {
                    post.tags = tagResults;
                    console.log(post);
                    res.status(status).json(post);
                });
        });
}

const postControllerPromise = {
    // INDEX: Ritorna la lista dei post con i tag aggregati (filtro opzionale per tag)
    index: (req, res) => {
        const { tags: tagFilter } = req.query;

        // Se è presente il filtro ?tags=id, filtriamo i post per quel tag
        let postsSql, postsParams;
        if (tagFilter) {
            postsSql = `
                SELECT DISTINCT posts.* FROM posts
                JOIN post_tag ON posts.id = post_tag.post_id
                WHERE post_tag.tag_id = ?
            `;
            postsParams = [tagFilter];
        } else {
            postsSql = 'SELECT * FROM posts';
            postsParams = [];
        }

        const tagSql = `
            SELECT post_tag.post_id, tags.*
            FROM tags
            JOIN post_tag ON tags.id = post_tag.tag_id
        `;

        // Eseguiamo entrambe le query in parallelo con Promise.all
        Promise.all([
            dbConnectionPromise.query(postsSql, postsParams),
            dbConnectionPromise.query(tagSql),
        ])
            .then(([[posts], [tagRows]]) => {
                if (posts.length === 0) return res.json([]);

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
            })
            .catch((err) => {
                console.error('Errore query SELECT INDEX:', err);
                return res.status(500).json({ error: 'Errore del server: impossibile recuperare i post.' });
            });
    },

    // SHOW: Ritorna i dettagli di un singolo post (con tags aggregati)
    show: (req, res) => {
        const { id } = req.params;
        const sql = 'SELECT * FROM posts WHERE id = ?';

        // Esecuzione della query per recuperare un singolo post tramite ID
        dbConnectionPromise.query(sql, [id])
            .then(([results]) => {
                if (results.length === 0) return res.status(404).json({ error: 'Post non trovato' });

                const post = results[0];

                // Query per recuperare i tag associati al post tramite la tabella pivot
                const tagSql = `
                    SELECT tags.* FROM tags
                    JOIN post_tag ON tags.id = post_tag.tag_id
                    WHERE post_tag.post_id = ?
                `;

                return dbConnectionPromise.query(tagSql, [id])
                    .then(([tagResults]) => {
                        post.tags = tagResults;
                        console.log(post);
                        res.json(post);
                    });
            })
            .catch((err) => {
                console.error('Errore query SELECT SHOW:', err);
                return res.status(500).json({ error: 'Errore del server' });
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
        dbConnectionPromise.query(sql, newPostData)
            .then(([result]) => {
                const newId = result.insertId;

                // Se ci sono tag da associare, li inseriamo nella tabella pivot
                if (tags && tags.length > 0) {
                    const tagValues = tags.map(tagId => [newId, tagId]);
                    const tagSql = 'INSERT INTO post_tag (post_id, tag_id) VALUES ?';

                    return dbConnectionPromise.query(tagSql, [tagValues])
                        .then(() => fetchPostWithTagsPromise(newId, res, 201));
                }

                return fetchPostWithTagsPromise(newId, res, 201);
            })
            .catch((err) => {
                if (err.message === 'NOT_FOUND') return;
                console.error('Errore query INSERT STORE:', err);
                return res.status(500).json({ error: 'Errore del server durante la creazione del post.' });
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
        dbConnectionPromise.query(sql, [updatedPostData, id])
            .then(([result]) => {
                if (result.affectedRows === 0) {
                    res.status(404).json({ error: 'Post non trovato' });
                    throw new Error('NOT_FOUND');
                }

                // Cancelliamo tutti i tag esistenti dalla pivot
                return dbConnectionPromise.query('DELETE FROM post_tag WHERE post_id = ?', [id]);
            })
            .then(() => {
                // Inseriamo i nuovi tag (se presenti)
                if (tags && tags.length > 0) {
                    const tagValues = tags.map(tagId => [id, tagId]);
                    return dbConnectionPromise.query('INSERT INTO post_tag (post_id, tag_id) VALUES ?', [tagValues]);
                }
            })
            .then(() => fetchPostWithTagsPromise(id, res))
            .catch((err) => {
                if (err.message === 'NOT_FOUND') return;
                console.error('Errore query UPDATE:', err);
                return res.status(500).json({ error: "Errore del server durante l'aggiornamento del post." });
            });
    },

    // MODIFY: Aggiorna parzialmente un post
    modify: (req, res) => {
        const { id } = req.params;
        const { tags, ...fieldsToUpdate } = req.body; // Separiamo tags dagli altri campi

        if (Object.keys(fieldsToUpdate).length === 0 && tags === undefined) {
            return res.status(400).json({ error: 'Nessun campo da aggiornare fornito.' });
        }

        // Helper locale per aggiornare i tag nella pivot e rispondere
        const handleTagsAndRespond = () => {
            if (tags !== undefined) {
                return dbConnectionPromise.query('DELETE FROM post_tag WHERE post_id = ?', [id])
                    .then(() => {
                        if (tags.length > 0) {
                            const tagValues = tags.map(tagId => [id, tagId]);
                            return dbConnectionPromise.query('INSERT INTO post_tag (post_id, tag_id) VALUES ?', [tagValues]);
                        }
                    })
                    .then(() => fetchPostWithTagsPromise(id, res));
            }
            return fetchPostWithTagsPromise(id, res);
        };

        // Se non ci sono campi del post da aggiornare (solo tags), controlliamo che esista e aggiorniamo solo i tag
        if (Object.keys(fieldsToUpdate).length === 0) {
            return dbConnectionPromise.query('SELECT id FROM posts WHERE id = ?', [id])
                .then(([results]) => {
                    if (results.length === 0) {
                        res.status(404).json({ error: 'Post non trovato' });
                        throw new Error('NOT_FOUND');
                    }
                    return handleTagsAndRespond();
                })
                .catch((err) => {
                    if (err.message === 'NOT_FOUND') return;
                    console.error('Errore query MODIFY:', err);
                    return res.status(500).json({ error: 'Errore del server durante la modifica del post.' });
                });
        }

        const sql = 'UPDATE posts SET ? WHERE id = ?';

        // Aggiorniamo i campi del post
        dbConnectionPromise.query(sql, [fieldsToUpdate, id])
            .then(([result]) => {
                if (result.affectedRows === 0) {
                    res.status(404).json({ error: 'Post non trovato' });
                    throw new Error('NOT_FOUND');
                }
                return handleTagsAndRespond();
            })
            .catch((err) => {
                if (err.message === 'NOT_FOUND') return;
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
