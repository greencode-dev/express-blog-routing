// Importiamo il modulo mysql2/promise per interagire col database
const mysql = require('mysql2/promise');

// Carichiamo le variabili d'ambiente
require('dotenv').config();

// Definiamo i parametri di configurazione per il collegamento al server MySQL
const dbConfiguration = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
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
