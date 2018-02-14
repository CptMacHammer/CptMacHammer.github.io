//Globals
var miner1;
var miner2;
var miner1Image,miner2Image;
var miners;
var debris;
var obstacle;
var gameTimer;
var totalDebris = Math.floor(Math.random() * 600) + 100;
var MARGIN = 10;


//preload sprites
function preload(){
// debris sprites

// miner sprites

// obstacles


}

// setup
function setup(){
  //initalize canvas
  var canv = createCanvas(windowWidth, windowHeight);
  //var canv = createCanvas(800, 400);

  canv.parent("myCanvas");

  useQuadTree(true);
  // Images for everything
  miners = new Group();
  for(var i = 0; i<2; i++){
    createMiner();
  }

  debris = new Group();

  for(var i = 0; i<totalDebris; i++) {
    var ang = random(360);
    var px = width/2 + 1000 * cos(radians(ang));
    var py = height/2+ 1000 * sin(radians(ang));
    createDebris(1, px, py);
  }
}

// main loop function
function draw(){
  // background
  background(0);

  fill(255);
  textAlign(CENTER);
  text("Miner 1: " + miners[0].score.toString(), MARGIN+20, 20);
  text("Miner 2: " + miners[1].score.toString(), width - MARGIN-30, 20);

  // game timer
  // If game timer reaches 0 end the game.
  // Display the high score and declare a winner


  // Every 1 second in the game loop
  // spawn random debris and random obstacles
  // update debris and obstacle movement

  // Margin detection for all sprites.

  for(var i = 0; i < allSprites.length; i++){
    var s = allSprites[i];
    if(s.position.x< -MARGIN)s.position.x = width+MARGIN;
    if(s.position.x> width+MARGIN)s.position.x = -MARGIN;
    if(s.position.y< -MARGIN)s.position.y = height+MARGIN;
    if(s.position.y> height+MARGIN)s.position.y = -MARGIN;
  }

  // detect overlap for debris and ships
  miners.overlap(debris, debrisHit);

  // detect collisions between miners

  // detect collisions between miners and obstacles

  // update movements of miner1 and miner2 according to keyboard inputs

  if(keyDown(LEFT_ARROW))
    miners[0].rotation -= 4;
  if(keyDown(RIGHT_ARROW))
    miners[0].rotation += 4;
  if(keyDown(UP_ARROW)){
      miners[0].addSpeed(.2, miners[0].rotation);
      miners[0].changeAnimation("thrust");
  }
  else {
    miners[0].changeAnimation("normal");
  }

  if(keyDown("a"))
    miners[1].rotation -= 4;
  if(keyDown("d"))
    miners[1].rotation += 4;
  if(keyDown("w")){
      miners[1].addSpeed(.2, miners[1].rotation);
      miners[1].changeAnimation("thrust");
  }
  else {
    miners[1].changeAnimation("normal");
  }

  drawSprites();

  if(debris.length == 0){
    if(miners[0].score > miners[1].score) {
      text("Miner 1 is winner ", width/2, height/2);
    } else {
      text("Miner 2 is winner ", width/2, height/2);
    }
  }


  // draw all sprites

} // End draw loop

// function to start a newGame
function newGame(){

} //end newGame
function createMiner(){
  var miner = createSprite(random(100,width/2), random(100,height/2));
  var minerImage = loadImage("assets/asteroids_ship0001.png");

  miner.addImage("normal", minerImage);
  miner.addAnimation("thrust", "assets/asteroids_ship0002.png", "assets/asteroids_ship0007.png");
  miner.maxSpeed = 6;
  miner.friction = .02;
  miner.setCollider("circle",0,0,20);
  miner.debug = true;
  miner.score = 0;
  miners.add(miner);
  return miner;
}

function createDebris(type,x,y){
  var a = createSprite(x, y);
  var img  = loadImage("assets/asteroid"+floor(random(0,2))+".png");
  a.addImage(img);
  a.setSpeed(2.5-(type/2), random(360));
  a.rotationSpeed = .5;
  //a.debug = true;
  a.type = type;

  if(type == 2)
    a.scale = .6;
  if(type == 1)
    a.scale = .3;

  a.mass = 2+a.scale;
  a.setCollider("circle", 0, 0, 50);
  debris.add(a);
  return a;

}
// handles collisions between miners and debris
function debrisHit(miner, Debris){
  Debris.remove();
  miner.score++;

}


function createObstacle(){

}



// function obstacleHit
function obstacleHit(){

}
