const index = (req, res) => {

    const sql = 'SELECT * FROM posters'

    connection.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' })
        }

        res.json(results);
    })

}

const show = (req, res) => {
    res.send(`Pagina di dettaglio del poster`)
}

module.exports = { index, show };