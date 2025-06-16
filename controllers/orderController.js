const connection = require(`../data/db`)

const storeOrders = (req, res) => {

    // funzione per la validazione dei dati numerici
    const numValidator = (num) => {
        if (isNaN(num) || num <= 0) {
            return res.status(400).json({
                error: `Dati non validi`
            });
        }
        return num;
    }

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


    // Controllo che shipment_costs sia un numero valido
    const shipmentCosts = numValidator(parseFloat(shipment_costs));

    // Funzione per gestire gli errori
    const handleError = (message) => {
        // rollback annulla tutte le modifiche fatte fino ad ora all'interno di transaction
        connection.rollback(() => {
            res.status(500).json({ error: message });
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

        // funzione createOrder() --------------------------------------------------------------------------------------------------------------------------------------
        // Creo la funzione che andrà a creare l'ordine una volta che avrò finito di elaborare i posters
        const createOrder = () => {
            // Calcolo del prezzo totale
            const total_price = subtotal + parseFloat(shipmentCosts);

            // Adesso vado ad inserire l'ordine nella table orders
            const orderSql = `
            INSERT INTO orders 
            (name, email, address, subtotal_price, shipment_costs, total_price, order_status, order_date, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
            `
            connection.query(orderSql, [name, email, address, subtotal, shipmentCosts, total_price], (err, orderResult) => {
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

                        // Vado ad aggiornare la tabella dei poster sottraendo le vendite allo stock
                        // Quindi vado a ridurre lo stock disponibile, aumento le vendite del prodotto ed aggiorno il temspamp
                        const updateSql = `
                            UPDATE posters
                            SET stock_quantity = stock_quantity - ?,
                                total_sell = total_sell + ?,
                                updated_at = NOW()
                            WHERE id = ?
                        `

                        connection.query(updateSql, [poster.quantity, poster.quantity, poster.poster_id], (err) => {

                            if (err) return handleError(`Errore durante l'aggiornamento dello stock: ${err}`);

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
            })
        }
        // fine funzione createOrder() ----------------------------------------------------------------------------------------------------------------------------------------

        console.log(`comicio a ciclarmi i poster`)
        // Mi ciclo i poster dell'ordine
        posters.forEach((posterData, i) => {
            console.log(`Ciclo poster ${i}`)

            // Controllo che l'id sia un numero valido
            const posterId = numValidator(parseInt(posterData.id));

            // Controllo che quantity sia un numero valido
            const quantity = numValidator(parseInt(posterData.quantity));

            // Recupero il poster corrispondente dal db
            const sql = `
            SELECT * FROM posters
            WHERE id = ? AND available = 1
            `
            connection.query(sql, [posterId], (err, result) => {
                if (err) return handleError(`Errore database: ${err}`);
                if (result === 0) return handleError(`Poster ${posterId} non disponibile`);
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

module.exports = { storeOrders };


/*
{
    "name": "Francesco Palazzo",
    "email": "francescopalazzo09@gmail.com",
    "address": "Vico Navarria",
    "shipment_costs": 5,
    "posters": [
        {
            "id": 1,
            "quantity": 2
        },
        {
            "id": 2,
            "quantity": 4
        }
    ]
}
*/ 