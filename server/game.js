class Game{
  constructor(personA, personB, id){
    this.puck = {
      x:500,
      y:250,
      dx:-10,
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
    //Create score variable or object
    this.score = {
      A: 0,
      B: 0
    }

    this.sounds = [];

    this.pingA = 0;
    personA.join(id).emit("found",id, personB.username);
    personA.on("input",(input) => {
        this.A.y+=(input*3);
        if(this.A.y >= 500){
          this.A.y-=3;
        }
        else if(this.A.y <= 0){
          this.A.y+=3;
        }
    })
    this.pingB = 0;
    personB.join(id).emit("found",id, personA.username);
    personB.on("input",(input) => {
        this.B.y+=(input*3);
         if(this.B.y >= 500){
          this.B.y-=3;
         }
         else if( this.B.y <= 0){
           this.B.y+=3;
         }
    })
    console.log("New Game between " + personA.username + " and " + personB.username);
    setInterval(this.physicsUpdate.bind(this),1000/30);
  }

  physicsUpdate(){
    const ballSlope = this.puck.dy/this.puck.dx;

    const slopes = {
      au: (this.puck.y-(this.A.y-50))/(this.puck.x-50),
      al: (this.puck.y-(this.A.y+50))/(this.puck.x-50),
      bu: (this.puck.y-(this.B.y-50))/(this.puck.x-952.5),
      bl: (this.puck.y-(this.B.y+50))/(this.puck.x-952.5)
    }

    if(this.puck.x+this.puck.dx <= 50 && ballSlope < slopes.au && ballSlope > slopes.al){
      this.puck.y-=ballSlope*(this.puck.x-50);
      let dxRatio = 1-((this.puck.x-50)/this.puck.dx);
      calcBounceAngle(this,"A",1);
      this.puck.y += this.puck.dy*dxRatio;
      this.puck.x += this.puck.dx*dxRatio;
      this.sounds.push("paddle");
    }else if(this.puck.x+this.puck.dx >= 950 && ballSlope > slopes.bu && ballSlope < slopes.bl){
      this.puck.y-=ballSlope*(950-this.puck.x);
      let dxRatio = 1-((950-this.puck.x)/this.puck.dx);
      calcBounceAngle(this,"B",-1);
      this.puck.y += this.puck.dy*dxRatio;
      this.puck.x += this.puck.dx*dxRatio;
      this.sounds.push("paddle");
    }

    if(this.puck.y <= 10 || this.puck.y >= 490){
      this.sounds.push("roof");
      this.puck.dy*=-1;
    }

    this.puck.x+=this.puck.dx;
    this.puck.y+=this.puck.dy;

    if(this.puck.x > 1000 || this.puck.x < 0){
      if(this.puck.x > 1000){ this.score.A++ }
      else{                   this.score.B++ };
      this.puck.x = 500
      this.puck.y = 250
      this.puck.dy = 0,
      this.puck.dx = this.puck.speed;
      this.sounds.push("score");
      if(Math.random()<0.5){this.puck.dx = -this.puck.speed};
    }

    const time = process.hrtime();
    let parent = this;
    //Send score to players aswell
    this.A.socket.emit("update",this.puck, this.A.y, this.B.y, this.pingA, this.pingB, this.score, this.A.socket.username, this.B.socket.username, this.sounds, function(){
      parent.pingA = Math.round(process.hrtime(time)[1]/1000000)
    });
    this.B.socket.emit("update",this.puck, this.A.y, this.B.y, this.pingA, this.pingB, this.score, this.A.socket.username, this.B.socket.username, this.sounds, function(){
      parent.pingB = Math.round(process.hrtime(time)[1]/1000000)
    });

    this.sounds = [];
  }
}

function calcBounceAngle(classThis,side,neg){
  classThis.puck.speed*=1.03;
  let bounceAngle = 1.309*((classThis.puck.y-classThis[side].y)/50);
  if(bounceAngle>1.309){ bounceAngle = 1.309}
  else if(bounceAngle<-1.309){ bounceAngle = -1.309}
  classThis.puck.dx=neg*classThis.puck.speed*Math.cos(bounceAngle);
  classThis.puck.dy=classThis.puck.speed*Math.sin(bounceAngle);
}
module.exports = Game;
