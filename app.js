const express = require(`express`);
const app = express();
const port = process.env.PORT || 3000;

const imagePath = require(`./middlewares/imagePath.js`);
const notFound = require(`./middlewares/notFound.js`);
const errorsHandler = require("./middlewares/errorsHandler.js");

const postersRouter = require(`./routers/postersRouter.js`);
const orderRouter = require(`./routers/orderRouter.js`);

app.use(imagePath);

app.use(express.static(`public`));

app.use(express.json());

app.use(`/posters`, postersRouter);
app.use(`/order`, orderRouter);

app.get(`/`, (req, res) => {
    res.send(`Benvenuto`)
})

app.use(notFound);
app.use(errorsHandler);

app.listen(port, () => {
    console.log(`Il server è in ascolto`)
})