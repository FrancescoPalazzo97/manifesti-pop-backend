// Middleware per la gestione degli errori nell'applicazione
const errorsHandler = (err, req, res, next) => {

    // Imposta lo status della risposta HTTP su "500" (Errore interno del server)
    res.status(500);

    // Restituisce una risposta JSON contenente il messaggio di errore
    res.json({
        error: err.message
    });
};

// Esporta il middleware per poterlo utilizzare nell'app principale
module.exports = errorsHandler;