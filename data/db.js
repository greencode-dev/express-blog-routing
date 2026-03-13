const mysql = require('mysql2');

const dbConfiguration = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'blog_db',
};

function onDatabaseConnection(error) {
    if (error) throw error;

    console.log('Connessione a MySQL avvenuta con successo!');
}

const dbConnection = mysql.createConnection(dbConfiguration);
dbConnection.connect(onDatabaseConnection);

module.exports = dbConnection;
