# Racer
Reverse engineered Chrome Experiment RACER

## Getting Started

### Server
The server runs on HTTPS + WSS, so you need to create an SSL certificate and key using the following commands:

```sh
cd ssl
openssl req -nodes -new -x509 -keyout server.key -out server.cert
```

Edit `config.json` as necessary.

Start the server by running:
```sh
npm i
npm start
```

### Client

Connect to the client via `https://<server_ip>:<server_port>/racer/`
