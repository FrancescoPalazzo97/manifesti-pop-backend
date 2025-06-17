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
    const slug = req.params.slug;

    // Estrae "vote" e "text" dal corpo della richiesta
    const { vote, text } = req.body;

    // Query SQL per inserire una nuova recensione nella tabella "reviews"
    const sql = `INSERT INTO reviews (poster_slug, vote, text, created_at) VALUES (?, ?, ?, NOW())`;

    // Esegue la query al database passando i dati ricevuti
    connection.query(sql, [slug, vote, text], (err, result) => {
        // Se c'è un errore nella query, restituisce un messaggio di errore
        if (err) return res.status(500).json({ error: `Database query failed: ${err}` });

        // Conferma che la recensione è stata inserita correttamente
        res.status(201).json({
            status: 'success',
            message: 'Recensione inserita con successo'
        });
    });

};

// Funzione per ottenere i poster più venduti
const getMostSold = (req, res) => {
    // Parametro opzionale per limitare il numero di risultati (default: 10)
    const limit = parseInt(req.query.limit) || 10;

    // Query SQL per ordinare i poster per total_sell in ordine decrescente
    const sql = `
        SELECT * FROM posters 
        WHERE available = 1 
        ORDER BY total_sell DESC 
        LIMIT ?
    `;

    connection.query(sql, [limit], (err, results) => {
        if (err) return res.status(500).json({ error: `Database query failed: ${err}` });

        // Trasforma i risultati per includere il percorso completo dell'immagine
        const posters = results.map(result => {
            return {
                ...result,
                image_url: `${req.imagePath}${result.image_url}`
            };
        });

        res.json({
            status: 'success',
            message: `Top ${limit} poster più venduti`,
            data: posters
        });
    });
};

// Funzione per ottenere i poster più recenti
const getMostRecent = (req, res) => {
    // Parametro opzionale per limitare il numero di risultati di default lo imposto a 10
    const limit = parseInt(req.query.limit) || 10;

    // Query SQL per ordinare i poster per data di creazione in ordine decrescente
    const sql = `
        SELECT * FROM posters 
        WHERE available = 1 
        ORDER BY creation_date DESC 
        LIMIT ?
    `;

    connection.query(sql, [limit], (err, results) => {
        if (err) return res.status(500).json({ error: `Database query failed: ${err}` });

        // Trasforma i risultati per includere il percorso completo dell'immagine
        const posters = results.map(result => {
            return {
                ...result,
                image_url: `${req.imagePath}${result.image_url}`
            };
        });

        res.json({
            status: 'success',
            message: `Ultimi ${limit} poster aggiunti`,
            data: posters
        });
    });
};

// Funzione per ottenere tutti gli artisti disponibili
const getArtists = (req, res) => {
    // Query SQL per ottenere tutti gli artisti distinti con il conteggio dei loro poster
    const sql = `
        SELECT 
            artist,
            COUNT(*) as poster_count,
            SUM(total_sell) as total_sales
        FROM posters 
        WHERE available = 1 
        GROUP BY artist 
        ORDER BY artist ASC
    `;

    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: `Database query failed: ${err}` });

        res.json({
            status: 'success',
            message: 'Lista artisti disponibili',
            data: results
        });
    });
};

// Funzione per ottenere i poster di un artista specifico
const getByArtist = (req, res) => {
    const artist = req.params.artist;

    // Parametri per ordinamento e limite
    const orderBy = req.query.orderBy || 'creation_date'; // total_sell, price, creation_date
    const order = req.query.order === 'asc' ? 'ASC' : 'DESC';
    const limit = parseInt(req.query.limit) || 50;

    // Validazione del parametro orderBy per sicurezza
    const validOrderBy = ['total_sell', 'price', 'creation_date', 'title'];
    if (!validOrderBy.includes(orderBy)) {
        return res.status(400).json({
            error: `Parametro orderBy non valido. Valori accettati: ${validOrderBy.join(', ')}`
        });
    }

    // Query SQL per ottenere i poster di un artista specifico
    const sql = `
        SELECT * FROM posters 
        WHERE artist = ? AND available = 1 
        ORDER BY ${orderBy} ${order}
        LIMIT ?
    `;

    connection.query(sql, [artist, limit], (err, results) => {
        if (err) return res.status(500).json({ error: `Database query failed: ${err}` });

        if (results.length === 0) {
            return res.status(404).json({
                error: `Nessun poster trovato per l'artista: ${artist}`
            });
        }

        const posters = results.map(result => {
            return {
                ...result,
                image_url: `${req.imagePath}${result.image_url}`
            };
        });

        res.json({
            status: 'success',
            message: `Poster dell'artista: ${artist}`,
            artist: artist,
            total_found: results.length,
            data: posters
        });
    });
};

const search = (req, res) => {
    // Mi vad a prendere il parametro di ricerca
    const term = req.query.term;

    // Controllo se esiste
    if (!term || term.trim().length === 0) {
        return res.status(400).json({
            error: `Parametro di ricerca mancante`
        })
    }

    //Inserisco altri parametri di filtraggio????
    // DA VEDERE 

    console.log(`Cerco ${term}`);

    // Qui vado a mettere il valore allínterno del simbolo % in modo da cercare il valore ovunque
    const searchedTerm = `%${term}%`;

    const sql = `
        SELECT * FROM posters 
        WHERE available = 1 
        AND (
            title LIKE ? OR 
            artist LIKE ?
        )
    `;

    // Mi creo un array dei valori da inserire nella query
    const params = [searchedTerm, searchedTerm]

    connection.query(sql, params, (err, searchResults) => {
        if (err) return res.status(500).json({ error: `Database query failed: ${err}` });

        // Vado, come al solito, a definire il path dell'immagine
        const posters = searchResults.map(result => {
            return {
                ...result,
                image_url: `${req.imagePath}${result.image_url}`
            }
        })

        // Restituisco i risultati
        res.json({
            status: 'success',
            message: `Risultati ricerca per: "${term}"`,
            data: posters
        })
    })

}

module.exports = { index, show, storeReviews, getMostSold, getMostRecent, getByArtist, getArtists, search };
