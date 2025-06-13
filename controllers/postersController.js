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

module.exports = { index, show };