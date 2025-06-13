// Middleware per definire il percorso delle immagini nel server
const imagePath = (req, res, next) => {

    // Crea un'URL dinamico per il percorso delle immagini basato sul protocollo e sull'host della richiesta
    req.imagePath = `${req.protocol}://${req.get(`host`)}/imgs/`;

    // Passa al middleware successivo nella catena di richiesta
    next();
};

// Esporta il middleware per poterlo utilizzare nell'app principale
module.exports = imagePath;