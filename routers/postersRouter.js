// Importa Express, un framework per creare applicazioni web in Node.js
const express = require(`express`);

// Crea un'istanza del router Express per gestire le rotte
const router = express.Router();

// Importa il controller che gestisce le operazioni sui "posters"
const postersController = require(`../controllers/postersController`);

// Estrae le funzioni dal controller per usarle nel router
const { index, show, store } = postersController;

// Definisce la rotta per ottenere tutti i posters (INDEX)
router.get('/', index);

// Definisce la rotta per ottenere un singolo poster tramite ID (SHOW)
router.get(`/:id`, show);

// Definisce la rotta per aggiungere una recensione a un poster tramite ID (STORE)
router.post('/:id', store);

// Esporta il router per poterlo utilizzare nell'app principale
module.exports = router;