const mysql = require('mysql2/promise');

const dbConfiguration = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'blog_db',
};

// Utilizziamo un pool di connessioni
const dbConnectionPromise = mysql.createPool(dbConfiguration);

// Logghiamo l'avvenuta connessione al primo tentativo riuscito
dbConnectionPromise.getConnection()
    .then(connection => {
        console.log('Connessione a MySQL (Promise Pool) avvenuta con successo!');
        connection.release();
    })
    .catch(error => {
        console.error('Errore durante la connessione a MySQL:', error);
    });

module.exports = dbConnectionPromise;
