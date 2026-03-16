// Importiamo il modulo myqsl2 per interagire col database
const mysql = require('mysql2');

// Carichiamo le variabili d'ambiente
require('dotenv').config();

// Definiamo i parametri di configurazione per il collegamento al server MySQL
const dbConfiguration = {
    host: process.env.DB_HOST, // Indirizzo del server
    user: process.env.DB_USER,      // Utente del database
    password: process.env.DB_PASSWORD,  // Password dell'utente
    database: process.env.DB_DATABASE, // Nome del database da utilizzare
};

// Funzione di callback per gestire l'esito della connessione
function onDatabaseConnection(error) {
    if (error) throw error; // Se c'è un errore, ferma l'applicazione e mostralo

    console.log('Connessione a MySQL (callback) avvenuta con successo!');
}

// Creiamo la vera e propria istanza di connessione passandogli la configurazione
const dbConnection = mysql.createConnection(dbConfiguration);

// Avviamo la connessione, passando la funzione di callback da eseguire al termine
dbConnection.connect(onDatabaseConnection);

// Esportiamo la connessione per poterla utilizzare negli altri file
module.exports = dbConnection;
