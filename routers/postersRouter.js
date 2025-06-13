// Importa Express, un framework per creare applicazioni web in Node.js
const express = require(`express`);

const { index, show, storeReviews } = postersController;

// Definisce la rotta per ottenere tutti i posters (INDEX)
router.get('/', index);

// Definisce la rotta per ottenere un singolo poster tramite ID (SHOW)
router.get(`/:id`, show);

// STORE
router.post('/:id', storeReviews);

// Esporta il router per poterlo utilizzare nell'app principale
module.exports = router;