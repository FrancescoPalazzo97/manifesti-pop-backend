// Importa il modulo mysql2 per gestire la connessione al database MySQL
const mysql = require(`mysql2`);

// Estrae le variabili d'ambiente necessarie per la connessione al database
const { DB_HOST, DB_USER, DB_PASSWORD, DATABASE_NAME } = process.env;

// Crea una connessione al database utilizzando le variabili d'ambiente
const connection = mysql.createConnection({
    host: DB_HOST, // Indirizzo del database
    user: DB_USER, // Nome utente del database
    password: DB_PASSWORD, // Password del database
    database: DATABASE_NAME // Nome del database a cui connettersi
});

// Inizializza la connessione e gestisce eventuali errori
connection.connect(err => {
    if (err) throw err; // Se c'è un errore, interrompe l'esecuzione e lo mostra
    console.log(`Connected to MySQL!`); // Conferma la connessione avvenuta con successo
});

// Esporta la connessione per poterla utilizzare in altri file
module.exports = connection;