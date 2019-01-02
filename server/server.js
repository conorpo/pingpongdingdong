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

let people = [];
let games = [];
class Game{
  constructor(personA, personB, id){
    this.A = personA;
    this.B = personB;
    personA.join(id).emit("found",id, personB.username);
    personB.join(id).emit("found",id, personA.username);
    console.log("New Game between " + personA.username + " and " + personB.username);
  }
}

io.on('connection',(socket) => {
    console.log("New connection: " + socket.id);
    socket.on("queue", (username, callback) => {
      console.log("New queue " + username)
      if(!isRealString(username)){
            return callback('Name is required, and must be less than 20 chars long');
      };
      socket.username = username;
      people.push(socket);
      checkGame();
    })
    socket.on('disconnect', () => {
      people.splice(people.indexOf(socket),1);
    })
});

function checkGame(){
  if(people.length > 1){
    const newGame = games.length.toString();
    const personA = people.shift()
    const personB = people.shift();
    games.push(new Game(personA, personB, newGame));
  }
}

server.listen(port, () => {
    console.log("Listeing on port " + port);
});

let isRealString = (str) => {
    return typeof str == "string" && str.trim().length > 0 && str.trim().length < 20;
}
