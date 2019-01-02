let socket = io();

socket.on('connect', function(){
  socket.emit('queue', deparam(window.location.search).username , function(err){
    if(err){
      alert(err);
      window.location.href = "/";
    }
  })
  socket.on('found', function(id, username){
    document.write("Found a game with " + username + " in Game ID " + id);
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
