const imagePath = (req, res, next) => {
    req.imagePath = `${req.protocol}://${req.get(`host`)}/imgs/`
    next()
}

module.exports = imagePath;