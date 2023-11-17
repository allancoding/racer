# Racer
Reverse engineered Chrome Experiment RACER

## Getting Started

### Server
If you enable https you will need to create an SSL certificate and key using the following commands:

```sh
openssl req -nodes -new -x509 -keyout ssl/server.key -out ssl/server.cert
```
Edit `config.json` as necessary.
```
{
    "port": "3000",
    "https": false,
}
```
`port` is the port the server will listen on. `https` is a boolean value that determines whether the server will use https or not.

Start the server by running:
```sh
npm i
npm start
```

### Client

Connect to the client via `<domain-or-ip-of-server>/racer/`
