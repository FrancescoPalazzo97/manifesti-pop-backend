// Importa Express, un framework per creare applicazioni web in Node.js
const express = require(`express`);

// Inizializza un'istanza dell'app Express
const app = express();

// Imposta la porta su cui il server sarà in ascolto (usa quella definita nelle variabili d'ambiente, altrimenti 3000)
const port = process.env.DB_PORT || 3000;

// Importa middleware personalizzati
const imagePath = require(`./middlewares/imagePath.js`); // Middleware per gestire i percorsi delle immagini
const notFound = require(`./middlewares/notFound.js`); // Middleware per gestire le pagine non trovate (errore 404)
const errorsHandler = require("./middlewares/errorsHandler.js"); // Middleware per gestire errori generali dell'app

// Importa il router che gestisce le rotte relative ai "posters"
const postersRouter = require(`./routers/postersRouter`);

// Usa il middleware per il percorso delle immagini
app.use(imagePath);

// Serve i file statici dalla cartella 'public' (CSS, immagini, ecc.)
app.use(express.static(`public`));

// Middleware per interpretare i dati in formato JSON nelle richieste HTTP
app.use(express.json());

// Monta il router dedicato ai "posters" sulla rotta `/posters`
app.use(`/posters`, postersRouter);

// Rotta principale che restituisce un messaggio di benvenuto
app.get(`/`, (req, res) => {
    res.send(`Benvenuto`);
});

// Usa il middleware per la gestione degli errori e per le pagine non trovate
app.use(errorsHandler); // Gestisce errori generici all'interno dell'app
app.use(notFound); // Restituisce una risposta 404 se la rotta richiesta non esiste

// Avvia il server e lo mette in ascolto sulla porta specificata
app.listen(port, () => {
    console.log(`Il server è in ascolto`);
});