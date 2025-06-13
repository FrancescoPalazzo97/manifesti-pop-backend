// Middleware per gestire le richieste a pagine inesistenti
const notFound = (req, res, next) => {

    // Imposta lo status della risposta HTTP su "404" (Pagina non trovata)
    res.status(404);

    // Restituisce una risposta JSON con un messaggio di errore
    res.json({
        error: "Not Found",
        message: "Pagina non trovata"
    });
};

// Esporta il middleware per poterlo utilizzare nell'app principale
module.exports = notFound;