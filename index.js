const express = require("express");
const app = express();
const mem = require("./mem_db.js");
const config = require("./config.json");
let server;
if (config.https == true) {   
    const https = require("https"); 
    const { readFileSync } = require("fs");
    try {
        const server = https.createServer({
            cert: readFileSync("./ssl/server.cert"),
            key: readFileSync("./ssl/server.key")
        }, app);
    } catch (e) {
        console.error("Could not start HTTPS server. Check your SSL certificates.");
        console.warn("You can generate self-signed certificates with the following command:");
        console.warn("openssl req -nodes -new -x509 -keyout ssl/server.key -out ssl/server.cert");
        process.exit(1);
    }
    server = https.createServer(app);
} else {
    const http = require('http');
    server = http.createServer(app);
}
const wss = require("./ws_server.js")(server, mem);
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
server.listen(config.port, () => {
    console.log(`Racer server listening on port ${config.port}`)
});
