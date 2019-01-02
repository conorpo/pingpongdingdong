var myCanvas = document.getElementById("myCanvas");
myCanvas.width = 1000;
myCanvas.height = 500;
var ctx = myCanvas.getContext('2d');

let keys = {
  "ArrowDown":0,
  "ArrowUp":0
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

setInterval(function(){
  socket.emit("input", (keys.ArrowDown+keys.ArrowUp));
},1000/60)

let socket = io();

socket.on('connect', function(){
  socket.emit('queue', deparam(window.location.search).username , function(err){
    if(err){
      alert(err);
      window.location.href = "/";
    }
  })
  socket.on('found', function(id, username){
    socket.on('update', function(ball, a, b, pingA, pingB, callback){
      ctx.clearRect(0,0,1000,500);

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 10, 0, 2*Math.PI);
      ctx.closePath();
      ctx.fill();

      ctx.fillRect(30, a-50, 20, 100);
      ctx.fillRect(950, b-50, 20, 100);

      console.clear();
      console.log(pingA, pingB)

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
