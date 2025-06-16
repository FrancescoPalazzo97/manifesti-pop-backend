// Importa Express, un framework per creare applicazioni web in Node.js
const express = require(`express`);
const cors = require(`cors`);

// Inizializza un'istanza dell'app Express
const app = express();
app.use(cors());
const port = process.env.PORT || 3000;


const imagePath = require(`./middlewares/imagePath.js`);
const notFound = require(`./middlewares/notFound.js`);
const errorsHandler = require("./middlewares/errorsHandler.js");

const postersRouter = require(`./routers/postersRouter.js`);
const orderRouter = require(`./routers/orderRouter.js`);

app.use(express.json());
app.use(imagePath);

// Serve i file statici dalla cartella 'public' (CSS, immagini, ecc.)
app.use(express.static(`public`));

// Middleware per interpretare i dati in formato JSON nelle richieste HTTP

// Monta il router dedicato ai "posters" sulla rotta `/posters`
app.use(`/posters`, postersRouter);
app.use(`/order`, orderRouter);

// Rotta principale che restituisce un messaggio di benvenuto
app.get(`/`, (req, res) => {
    res.send(`Benvenuto`);
});

app.use(notFound);
app.use(errorsHandler);

// Avvia il server e lo mette in ascolto sulla porta specificata
app.listen(port, () => {
    console.log(`Il server è in ascolto`);
});