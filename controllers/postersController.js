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

    // Funzioneper gestire gli errori
    const handleError = (message) => {
        // rollback annulla tutte le modifiche fatte fino ad ora all'interno di transaction
        connection.rollback(() => {
            res.status(500).json({ error: message });
        })
    }

    // Creo la funzione che andrà a creare l'ordine una volta che avrò finito di elaborare i posters
    const createOrder = () => {
        // Calcolo del prezzo totale
        const total_price = subtotal = parseFloat(shipment_costs);

        // Adesso vado ad inserire l'ordine nella table storeOrders
        const orderSql = `
        INSERT INTO orders 
        (name, email, address, subtotal_price, shipment_costs, total_price, order_status, order_date, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
        `
        connection.query(orderSql, [name, email, address, subtotal, shipment_costs, total_price], (err, orderResult) => {
            if (err) return handleError(`Errore creazione ordine: ${err}`);

            // Mi prendo l'id dell'ordine
            const order_id = orderResult.insertId; // insertId serve a prendere l'id autoincrementale che mysql ha generato dall'inserimetno in tabbella

            // Solito contatore per sapere quanit oster ho inserito nell'ordine
            let completedInserts = 0;

            // Adesso vado ad inserire i dettagli nella table di collegamento orders_posters
            // elaboratedPosters e l'Array di oggetti con i poster elaborati che ho creato all'interno della transazione
            elaboratedPosters.forEach(poster => {
                // Inserisco un poster alla volta
                const posterInsertSql = `
                INSERT INTO orders_posters
                (id_order, id_poster, quantity, unit_price)
                VALUES (?, ?, ?, ?)
                `
                connection.query(posterInsertSql, [order_id, poster.poster_id, poster.quantity, poster.unit_price], err => {
                    if (err) return handleError(`Errore inserimento nella tabella di collegamento: ${err}`);

                    // Incremento il contatore degli inserimetni
                    completedInserts++;

                    // Controlle se ho finito
                    if (completedInserts === elaboratedPosters.length) {
                        // Faciio il COMMIT della transazione
                        // commit() rende permanenti TUTTE le modifiche fatte finora
                        connection.commit(err => {
                            if (err) return handleError(`Errore commit: ${err}`);
                            // Se arrivo qui tutto è andato bene quindi restituisco messaggio di successo
                            res.status(201).json({
                                status: `success`,
                                message: `Ordine creato`,
                                data: {
                                    order_id: order_id,
                                    total_price: total_price
                                }
                            })
                        })
                    }
                })
            })
        })
    }


    // Avvio una transazione 
    // Una transazione garantisce che tutte le operazione effettuate vadano a buon fine e nessuna modifica venga applicata in caso di errore
    connection.beginTransaction(transError => {

        console.log(`Comincio transazione`)
        if (transError)
            return res.status(500).json({ error: `Errore: ${transError}` });

        // Totale di tutti i prezzi senza spesa di spedizione
        let subtotal = 0;

        // Contatore che mi serve a contare i poster controllati
        let postersChecked = 0;

        // Array che mi va a contenere i dati elaborati di ogni poster => {poster_id, quantity, unit_price}
        let elaboratedPosters = [];

        console.log(`comicio a ciclarmi i poster`)
        // Mi ciclo i poster dell'ordine
        posters.forEach((posterData, i) => {
            console.log(`Ciclo poster ${i}`)
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
                console.log(`Mi sono recuperato il poster ${i} dal db`)
                const posterResult = result[0];

                // Cointrollo se la quantità stock del poster recuperato dal db sia inferiore alla quantità dell'ordine
                // Se inferiore mando messaggio di errore ed annullo tutto
                console.log(`Icomicio a verificare se la quantità per il poster ${i} sia maggiore o minore a quella del db`)
                if (posterResult.stock_quantity < quantity) return handleError(`Stock insufficente per ${posterResult.title}`);

                // Imposto il prezzo al prezzo base
                let price = posterResult.price

                // Dopo di chè controllo se ci sono sconti
                console.log(`Controllo la presenza di scontistiche per poster ${i}`)
                if (posterResult.discount > 0) {
                    // Nel caso ci siano sconti vengono applicati
                    price = posterResult.price * (1 - posterResult.discount / 100);
                }

                // Calcolo il subtotale
                const posterSubtotal = price * quantity;

                subtotal += posterSubtotal;

                // Salvo il poster elaborato per usarlo nella creazione dell'ordine
                console.log(`pusho il tutto in elaboratedPosters`)
                elaboratedPosters.push({
                    poster_id: posterResult.id,
                    quantity: quantity,
                    unit_price: price
                })

                postersChecked++;
                console.log(`Vado al prossimo poster`)
                // FIX spostata la funzione all'interno di forEach e aggiunta condizione per via della asincronicità di forEach
                if (postersChecked === posters.length) {
                    console.log(`Poster finiti`)
                    // Invoco la funzione che mi crea l'ordine
                    createOrder();
                }
            })
        });
    })
}

module.exports = { index, show, storeReviews, storeOrders };