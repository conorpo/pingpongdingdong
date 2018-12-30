const path = require('path');
const express = require('express');
const socketIO = require('socket.io');

const http = require('http');
const publicPath = (path.join(__dirname,'..','public'));
const port = process.env.PORT || 3010;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection',(socket) => {
    console.log("New connectipn: " + socket.id);
});

server.listen(port, () => {
    console.log("Listeing on port " + port);
});
