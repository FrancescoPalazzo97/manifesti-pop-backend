const connection = require(`../data/db`)

const index = (req, res) => {

    const sql = 'SELECT * FROM posters'

    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: `Database query failed: ${err}` });

        const posters = results.map(result => {
            const obj = {
                ...result,
                image_url: `${req.imagePath}${result.image_url}`
            }
            return obj;
        })

        res.json(posters);
    })

}

const show = (req, res) => {

    const id = parseInt(req.params.id)
    console.log(id)

    const sql = `SELECT * FROM posters WHERE id = ?`

    connection.query(sql, [id], (err, posterResult) => {
        if (err) return res.status(500).json({ error: `Database query failed: ${err}` });
        if (posterResult.length === 0 || posterResult[0].id === null) return res.status(404).json({ error: `Poster con ID ${id} non trovato.` });

        const poster = {
            ...posterResult[0],
            image_url: `${req.imagePath}${posterResult[0].image_url}`
        }

        res.json(poster)
    })
}

const storeReviews = (req, res) => {
    const id = parseInt(req.params.id);

    const { vote, text } = req.body;

    const sql = `INSERT INTO reviews (id_poster, vote, text, created_at) VALUES (?, ?, ?, NOW())`;

    connection.query(sql, [id, vote, text], (err, result) => {

        if (err) return res.status(500).json({ error: `Database query failed: ${err}` });

        res.status(201).json({
            status: 'success',
            message: 'Recensione inserita con successo'
        })
    });

}

const storeOrders = (req, res) => {

    // Recupero dati dallla body request
    const {
        name,
        email,
        address,
        shipment_costs,
        posters
    } = req.body;

    // Controllo che tutti i campi essenziali siano presenti
    if (!name || !email || !address || !shipment_costs || !posters || posters.length === 0)
        return res.status(400).json({ error: `Mancano dei dati obbligatori` });

    // Creo la funzione che andrà a creare l'ordine una volta che avrò finito di elaborare i posters
    const createOrder = () => {

    }


    // Avvio una transazione 
    // Una transazione garantisce che tutte le operazione effettuate vadano a buon fine e nessuna modifica venga applicata in caso di errore
    connection.beginTransaction(transError => {

        if (transError)
            return res.status(500).json({ error: `Errore: ${transError}` });

        // Totale di tutti i prezzi senza spesa di spedizione
        let subtotal = 0;

        // Contatore che mi serve a contare i poster controllati
        let postersChecked = 0;

        // Array che mi va a contenere i dati elaborati di ogni poster => {poster_id, quantity, unit_price}
        let elaboratedPosters = [];

        // Funzioneper gestire gli errori
        const handleError = (message) => {
            // rollback annulla tutte le modifiche fatte fino ad ora all'interno di transaction
            connection.rollback(() => {
                res.status(500).json({ error: message });
            })
        }

        // Mi ciclo i poster dell'ordine
        posters.forEach((posterData, i) => {
            // Mi passo id e quantità come valori numerici
            const posterId = parseInt(posterData.id);
            const quantity = parseInt(posterData.quantity)

            // Recupero il poster corrispondente dal db
            const sql = `
            SELECT * FROM posters
            WHERE id = ? AND available = 1
            `
            connection.query(sql, [posterId], (err, result) => {
                if (err) return handleError(`Errore database: ${err}`);
                if (result === 0) return handleError(`Poster ${id} non disponibile`);

                const posterResult = result[0];

                // Cointrollo se la quantità stock del poster recuperato dal db sia inferiore alla quantità dell'ordine
                // Se inferiore mando messaggio di errore ed annullo tutto
                if (posterResult.stock_quantity < quantity) return handleError(`Stock insufficente per ${posterResult.title}`);

                // Imposto il prezzo al prezzo base
                let price = posterResult.price

                // Dopo di chè controllo se ci sono sconti
                if (posterResult.discount > 0) {
                    // Nel caso ci siano sconti vengono applicati
                    price = posterResult.price * (1 - posterResult.discount / 100);
                }

                // Calcolo il subtotale
                const posterSubtotal = price * quantity;

                subtotal += posterSubtotal;

                // Salvo il poster elaborato per usarlo nella creazione dell"ordine
                elaboratedPosters.push({
                    poster_id: posterResult.id,
                    quantity: quantity,
                    unit_price: price
                })

                postersChecked++;

            })
        });
    })
    // Invoco la funzione che mi crea l'ordine
    createOrder();
}

module.exports = { index, show, storeReviews, storeOrders };