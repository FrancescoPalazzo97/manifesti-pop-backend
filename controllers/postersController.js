const index = (req, res) => {
    res.send(`homepage posters`)
}

const show = (req, res) => {
    res.send(`Pagina di dettaglio del poster`)
}

module.exports = { index, show };