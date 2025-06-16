// Importa la connessione al database dal file db.js
const connection = require(`../data/db`);

// Funzione per ottenere tutti i posters presenti nel database
const index = (req, res) => {

    // Query SQL per selezionare tutti i dati dalla tabella "posters"
    const sql = 'SELECT * FROM posters';

    // Esegue la query al database
    connection.query(sql, (err, results) => {
        // Se c'è un errore nella query, restituisce un messaggio di errore
        if (err) return res.status(500).json({ error: `Database query failed: ${err}` });

        // Trasforma i risultati per includere il percorso completo dell'immagine
        const posters = results.map(result => {
            const obj = {
                ...result, // Mantiene i dati originali del poster
                image_url: `${req.imagePath}${result.image_url}` // Aggiunge il percorso completo dell'immagine
            };
            return obj;
        });

        // Restituisce la lista dei posters in formato JSON
        res.json(posters);
    });

};

// Funzione per ottenere un singolo poster tramite il suo ID
const show = (req, res) => {

    // Converte l'ID ricevuto dai parametri della richiesta in un numero intero
    const { slug } = req.params;

    // Query SQL per ottenere un singolo poster tramite ID
    const sql = `SELECT * FROM posters WHERE slug = ?`;

    const reviewSql = `SELECT * FROM reviews WHERE poster_slug = ?`;

    // Esegue la query al database passando l'ID come parametro
    connection.query(sql, [slug], (err, posterResult) => {
        // Se c'è un errore nella query, restituisce un messaggio di errore
        if (err) return res.status(500).json({ error: `Database query failed: ${err}` });

        // Se il poster non esiste, restituisce un errore 404
        if (posterResult.length === 0 || posterResult[0].slug === null)
            return res.status(404).json({ error: `Poster con slug ${slug} non trovato.` });

        // Crea un oggetto poster con il percorso completo dell'immagine
        const poster = {
            ...posterResult[0],
            image_url: `${req.imagePath}${posterResult[0].image_url}`
        };

        // Eseguo la query per mostrare le recensioni
        connection.query(reviewSql, [slug], (err, reviewResult) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            // Aggiungo le recensioni al post
            poster.reviews = reviewResult;

            // Restituisce il poster in formato JSON
            res.json(poster);

        });
    });
};

const storeReviews = (req, res) => {
    const id = parseInt(req.params.id);

    // Estrae "vote" e "text" dal corpo della richiesta
    const { vote, text } = req.body;

    // Query SQL per inserire una nuova recensione nella tabella "reviews"
    const sql = `INSERT INTO reviews (id_poster, vote, text, created_at) VALUES (?, ?, ?, NOW())`;

    // Esegue la query al database passando i dati ricevuti
    connection.query(sql, [id, vote, text], (err, result) => {
        // Se c'è un errore nella query, restituisce un messaggio di errore
        if (err) return res.status(500).json({ error: `Database query failed: ${err}` });

        // Conferma che la recensione è stata inserita correttamente
        res.status(201).json({
            status: 'success',
            message: 'Recensione inserita con successo'
        });
    });

};

module.exports = { index, show, storeReviews };
