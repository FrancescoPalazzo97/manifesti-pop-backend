const express = require(`express`);
const app = express();
const port = process.env.DB_PORT || 3000;

const imagePath = require(`./middlewares/imagePath.js`);
const notFound = require(`./middlewares/notFound.js`);
const errorsHandler = require("./middlewares/errorsHandler.js");

const postersRouter = require(`./routers/postersRouter`);

app.use(imagePath);

app.use(express.static(`public`));

app.use(express.json());

app.use(`/posters`, postersRouter);

app.get(`/`, (req, res) => {
    res.send(`Benvenuto`)
})

app.use(errorsHandler);
app.use(notFound);

app.listen(port, () => {
    console.log(`Il server è in ascolto`)
})