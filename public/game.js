var myCanvas = document.getElementById("myCanvas");
myCanvas.width = 1000;
myCanvas.height = 500;
var ctx = myCanvas.getContext('2d');

var keys = {
  "ArrowDown":0,
  "ArrowUp":0
}

var soundFiles = {
  "roof" : new Sound("assets/roof.ogg"),
  "paddle": new Sound("assets/paddle.ogg"),
  "score": new Sound("assets/score.ogg")
}

document.addEventListener("keydown",(evt) => {
  if(evt.key == "ArrowDown"){
    keys.ArrowDown = 1;
  }else if(evt.key == "ArrowUp"){
    keys.ArrowUp = -1;
  }
})

document.addEventListener("keyup",(evt) => {
  keys[evt.key] = 0;
})

var socket = io();

setInterval(function(){
  socket.emit("input", (keys.ArrowDown+keys.ArrowUp));
},1000/60)

const username = deparam(window.location.search).username;
socket.on('connect', function(){
  socket.emit('queue',  username , function(err){
    if(err){
      alert(err);
      window.location.href = "/";
    }
  })
  socket.on('found', function(id, username){
    socket.on('update', function(puck, a, b, pingA, pingB, score, aname, bname, sounds, callback){

      sounds.forEach(sound => {
        console.log(sound);
        console.log(soundFiles[sound]);
        soundFiles[sound].play()}
      );
      ctx.clearRect(0,0,1000,500);

      ctx.fillRect(puck.x-5,puck.y-5,10,10);

      ctx.fillRect(45, a-50, 5, 100);
      ctx.fillRect(950, b-50, 5, 100);

      //Draw score here with ctx.fillText , use the score variable
      ctx.font  = "16px Arial";
      ctx.fillStyle = "black";
      ctx.textAlign = "start";
      ctx.fillText(aname + ": " + score.A, 40, 480);
      ctx.textAlign = "end";
      ctx.fillText(bname + ": " + score.B, 950, 480);

      callback();
    });
  })
});

function deparam(uri){
    if(uri === undefined){
      uri = window.location.search;
    }
    var queryString = {};
    uri.replace(
      new RegExp(
        "([^?=&]+)(=([^&#]*))?", "g"),
        function($0, $1, $2, $3) {
        	queryString[$1] = decodeURIComponent($3.replace(/\+/g, '%20'));
        }
      );
    return queryString;
};

function Sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
} 
