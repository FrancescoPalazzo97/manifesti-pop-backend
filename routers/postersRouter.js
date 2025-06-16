// Importa Express, un framework per creare applicazioni web in Node.js
const express = require(`express`);

const router = express.Router();

const postersController = require('../controllers/postersController')


const { index, show, storeReviews, getMostSold, getMostRecent, getArtists, getByArtist } = postersController;

// Definisce la rotta per ottenere tutti i posters (INDEX)
router.get('/', index);

// Definisce la rotta per ottenere i poster più venduti
router.get('/most-sold', getMostSold);

// Definisce la rotta per ottenere i poster più recenti
router.get('/most-recent', getMostRecent);

// Definisce la rotta per ottenere tutti gli artisti
router.get('/artists', getArtists);

// Definisce la rotta per ottenere i poster di un artista specifico
router.get('/artist/:artist', getByArtist);

// Definisce la rotta per ottenere un singolo poster tramite ID (SHOW)
router.get(`/:slug`, show);

// STORE REVIEWS
router.post('/:id', storeReviews);

// Esporta il router per poterlo utilizzare nell'app principale
module.exports = router;