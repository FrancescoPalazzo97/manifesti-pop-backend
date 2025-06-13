const express = require(`express`);
const app = express();
const port = process.env.DB_PORT || 3000;

const postersRouter = require(`./routers/postersRouter`)

app.use(express.static(`public`));

app.use(express.json());

app.use(`/posters`, postersRouter);

app.get(`/`, (req, res) => {
    res.send(`Benvenuto`)
})

app.listen(port, () => {
    console.log(`Il server è in ascolto`)
})