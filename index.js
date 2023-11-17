const express = require("express");
const app = express();
const mem = require("./mem_db.js");
const wss = require("./ws_server.js")(app, mem);
const config = require("./config.json");
app.use(require("morgan")("dev"));
app.use(require("cors")());
app.get('/', (req, res) => {
    res.redirect('/racer');
});
app.use("/racer", express.static("client"));
app.get("/control/start", (req, res) => {
    res.send({
        gameId: 123456,
        relays: ['self','ws://localhost:8443'],
        secureRelays: ['self','wss://localhost:8443'],
    });
});
app.post("/control/register", (req, res) => {
    res.send({});
});
app.get("/control/join", (req, res) => {
    res.send({
        relay: 'self',
    });
});
app.listen(config.port, () => {
    console.log(`Racer server listening on port ${config.port}`)
});
