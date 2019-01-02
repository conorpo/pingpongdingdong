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
    this.ball = {
      x:500,
      y:250,
      dx:10,
      dy:0,
      speed: 10
    }
    this.A = {
      socket: personA,
      y: 250
    }
    this.B = {
      socket: personB,
      y: 250
    }
    this.id = id;
    this.pingA = 0;
    personA.join(id).emit("found",id, personB.username);
    personA.on("input",(input) => {
        this.A.y+=(input*3);
    })
    this.pingB = 0;
    personB.join(id).emit("found",id, personA.username);
    personB.on("input",(input) => {
        this.B.y+=(input*3);
    })
    console.log("New Game between " + personA.username + " and " + personB.username);
    setInterval(this.physicsUpdate.bind(this),1000/30);
  }

  physicsUpdate(){
    if(this.ball.x <= 10 || this.ball.x >= 990){
      this.ball.dx*=-1;
    }else if(Math.abs(this.ball.y-this.A.y) < 50 && this.ball.x <= 60 && this.ball.x > 60-this.ball.speed-0.1){
      this.ball.speed*=1.03;
      const bounceAngle = 1.309*((this.ball.y-this.A.y)/50);
      this.ball.dx=this.ball.speed*Math.cos(bounceAngle);
      this.ball.dy=this.ball.speed*Math.sin(bounceAngle);
    }else if(Math.abs(this.ball.y-this.B.y) < 50 && this.ball.x >= 940 && this.ball.x < 940+this.ball.speed+0.1){
      this.ball.speed*=1.01;
      const bounceAngle = 1.309*((this.ball.y-this.B.y)/50);
      this.ball.dx=-this.ball.speed*Math.cos(bounceAngle);
      this.ball.dy=this.ball.speed*Math.sin(bounceAngle);
    }

    if(this.ball.y <= 10 || this.ball.y >= 490){
      this.ball.dy*=-1;
    }

    this.ball.x+=this.ball.dx;
    this.ball.y+=this.ball.dy;

    const time = process.hrtime();
    this.A.socket.emit("update",this.ball, this.A.y, this.B.y, this.pingA, this.pingB, function(){
      this.pingA = Math.round(process.hrtime(time)[1]/1000000)
    });
    this.B.socket.emit("update",this.ball, this.A.y, this.B.y, this.pingA, this.pingB, function(){
      this.pingB = Math.round(process.hrtime(time)[1]/1000000)
    });
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
    const gameId = games.length.toString();
    const personA = people.shift()
    const personB = people.shift();
    games.push(new Game(personA, personB, gameId));
  }
}

server.listen(port, () => {
    console.log("Listeing on port " + port);
});

let isRealString = (str) => {
    return typeof str == "string" && str.trim().length > 0 && str.trim().length < 20;
}
