//Globals
var miner1; //player 1
var miner2; //player 2
var miner1Image,miner2Image;
var miners;// pc groups

var bullets; // shot out by player

var spaceLlama; // roaming power up
var spaceLlama_Sprite_Sheet; //sprites sheets hold information for movements
var spaceLlamaAnimation;
// llama moves with Perlin noise t and T are needed for this.
var t = 0;
var T = 1000;

// Scary mutants will chase the players
var scarySpaceMutant;
var scarySpaceMutantImg;
var scarySpaceMutants;

var debris;
var obstacles;

//Increments for the background alpha value
var inc = 0;
var incUp = true;
var winScore = 255;
var totalDebris = Math.floor(Math.random() * 30) + 10;

// manipulates the margins around the screen.
var MARGIN = 10;


//preload sprites
function preload(){
  spaceLlama_Sprite_Sheet = loadSpriteSheet('assets/llama.png',48,48,12);
  spaceLlamaAnimation = loadAnimation(spaceLlama_Sprite_Sheet);

  scarySpaceMutantImg = loadImage("assets/scarySpaceMutant.PNG");

  bulletImage = loadImage("assets/asteroids_bullet.png");

}

// setup
function setup(){
  //initalize canvas
  var canv = createCanvas(windowWidth - MARGIN, windowHeight - MARGIN);
  canv.parent("myCanvas");

  // Special Data structure to track the sprites and run the game more smoothly
  useQuadTree(true);

  // Create groups of sprites
  miners = new Group();
  bullets = new Group();
  debris = new Group();
  obstacles = new Group();
  scarySpaceMutants = new Group();

  // create all game sprites
  for(var i = 0; i<2; i++){
    createMiner();
  }

  for(var i = 0; i<totalDebris; i++) {
    var ang = random(360);
    var px = width/2 + 1000 * cos(radians(ang));
    var py = height/2+ 1000 * sin(radians(ang));
    createDebris(1, px, py);
  }

  for(var i = 0; i<10; i++) {
    createObstacle(random(width), random(height));
  }

  for(var i = 0; i < random(10)+1; i++){
    createScarySpaceMutant();
  }

  createSpaceLlama();
}

// main loop function
function draw(){
  // background
  // Change the background based on which player has a higher score
  if(miners[0].score > miners[1].score){
    background(miners[0].score,0,0,inc);
  } else if (miners[1].score > miners[0].score){
    background(22,0,miners[1].score,inc);
  } else{
    background(186,188,184,inc);
  }

  if(incUp == true){
    inc++;
    if(inc == 255) incUp = false;
  } else {
    inc--;
    if(inc == 0) incUp = true;
  }

  // UI texts for players
  textAlign(CENTER);
  textSize(30);
  fill('#964249');
  text("Miner 1: " + miners[0].score.toString(), MARGIN+100, 30);
  text("Shields: " + miners[0].shields.toString(), MARGIN+100, 70);
  fill(0,85,255);
  text("Miner 2: " + miners[1].score.toString(), width - MARGIN-100, 30);
  text("Shields: " + miners[1].shields.toString(), width - MARGIN-100, 70);

  // Margin detection for all sprites.
  for(var i = 0; i < allSprites.length; i++){
    var s = allSprites[i];
    if(s.position.x< -MARGIN)s.position.x = width+MARGIN;
    if(s.position.x> width+MARGIN)s.position.x = -MARGIN;
    if(s.position.y< -MARGIN)s.position.y = height+MARGIN;
    if(s.position.y> height+MARGIN)s.position.y = -MARGIN;
  }

  spaceLlamaMove();

// Move mutants using steering forces
// Mutants will find closest player and move towards them
for(var i = 0; i < scarySpaceMutants.length; i++){
  dist1 = Math.sqrt(Math.pow(scarySpaceMutants[i].position.x-miners[0].position.x,2)+Math.pow(scarySpaceMutants[i].position.y - miners[0].position.y,2))
  dist2 = Math.sqrt(Math.pow(scarySpaceMutants[i].position.x-miners[1].position.x,2)+Math.pow(scarySpaceMutants[i].position.y - miners[1].position.y,2))
  //set attraction point
  if(dist1 > dist2){
    scarySpaceMutants[i].attractionPoint(.3, miners[0].position.x, miners[0].position.y);
  } else{
    scarySpaceMutants[i].attractionPoint(.3, miners[1].position.x, miners[1].position.y);
  }
}


  //Collision resolution
  miners.overlap(debris, debrisHit);
  miners.overlap(spaceLlama, spaceLlamaHit);
  miners.overlap(bullets, bulletHitMiner);
  miners.bounce(miners, minersHit);

  scarySpaceMutant.displace(scarySpaceMutants);
  scarySpaceMutants.overlap(miners, mutantAttackMiner);
  scarySpaceMutants.overlap(spaceLlama, mutantAttackLlama);
  scarySpaceMutants.overlap(bullets, bulletHit);

  obstacles.displace(miners,obstacleHit);
  obstacles.displace(spaceLlama);
  obstacles.overlap(obstacles);

  debris.overlap(obstacles);
  debris.displace(spaceLlama);

  // update movements of miner1 and miner2 according to keyboard input
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
  if(keyDown(DOWN_ARROW)){
    var bullet = createSprite(miners[0].position.x+25, miners[0].position.y+25);
    bullet.addImage(bulletImage);
    bullet.setSpeed(10+miners[0].getSpeed(), miners[0].rotation);
    bullet.life = 10;
    bullets.add(bullet);
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
  if(keyDown('s')){
    var bullet = createSprite(miners[1].position.x+25, miners[1].position.y+25);
    bullet.addImage(bulletImage);
    bullet.setSpeed(10+miners[1].getSpeed(), miners[1].rotation);
    bullet.life = 10;
    bullets.add(bullet);
  }

  drawSprites();

  // Ends game if player gets the win score
  if(miners[0].score == winScore){
    noLoop();
    text("Miner 1 is winner ", width/2, height/2);
    for (var i = allSprites.length; i--; allSprites[i].remove());
  }

  if(miners[1].score == winScore){
    noLoop();
    text("Miner 2 is winner ", width/2, height/2);
    for (var i = allSprites.length; i--; allSprites[i].remove());
  }

  // Creates new debris
  if(debris.length <= 5){
    for(var i = 0; i < totalDebris;i++){
      var ang = random(360);
      var px = width/2 + 1000 * cos(radians(ang));
      var py = height/2+ 1000 * sin(radians(ang));
      createDebris(1, px, py);
    }
  }

  // Create ellipses to help players identify their miner sprites
  noStroke();
  fill(255,0,21);
  ellipse(miners[0].position.x, miners[0].position.y, 20, 20);
  fill(0,85,255);
  ellipse(miners[1].position.x, miners[1].position.y, 20, 20);

} // End draw loop

function createMiner(){
  var miner = createSprite(random(100,width/2), random(100,height/2));
  var minerImage = loadImage("assets/asteroids_ship0001.png");

  miner.addImage("normal", minerImage);
  miner.addAnimation("thrust", "assets/asteroids_ship0002.png", "assets/asteroids_ship0007.png");
  miner.setCollider("circle",0,0,20);
  miner.maxSpeed = 6;
  miner.friction = .05;
  miner.debug = true;
  miner.score = 0;
  miner.depth = 10;
  miner.shields = 1000;
  miners.add(miner);
  return miner;
}

// type in reference to image type
// x,y are locations in canvas
function createDebris(type,x,y){
  var a = createSprite(x, y);
  var img  = loadImage("assets/asteroid"+floor(random(0,2))+".png");
  a.addImage(img);
  a.setSpeed(2.5-(type/2), random(360));
  a.rotationSpeed = 4;
  a.maxSpeed = 10;
  a.type = type;
  a.life = random(100,300);

  if(type == 2)
    a.scale = .6;
  if(type == 1)
    a.scale = .3;

  a.setCollider("circle", 0, 0, 50);
  debris.add(a);
  return a;
}

function createObstacle(x,y){
  var obstacle = createSprite(x,y,random(100),random(100));
  obstacle.shapeColor = color(random(255),random(255),random(255));
  obstacle.life=800;
  obstacle.rotationSpeed = .1;
  obstacle.immovable = true;
  obstacles.add(obstacle);
}

function createSpaceLlama(){
  //spaceLlama = createSprite(random(width),random(height),32,32);
  spaceLlama = createSprite(width/2,height/2,32,32);
  spaceLlama.addAnimation('bounce', spaceLlamaAnimation);
  spaceLlama.friction = 0.02;
}

// Move space llama according to Perlin noise
function spaceLlamaMove(){
  spaceLlama.position.x = noise(t);
  spaceLlama.position.x = map(spaceLlama.position.x, 0, 1,0, width);
  spaceLlama.position.y = noise(T);
  spaceLlama.position.y = map(spaceLlama.position.y, 0, 1,0, width);
  t += 0.003;
  T += 0.001;
}

function createScarySpaceMutant(){
  scarySpaceMutant = createSprite(random(width),random(height),5,5);
  scarySpaceMutant.addImage(scarySpaceMutantImg);
  scarySpaceMutant.scale = 0.3;
  scarySpaceMutant.setSpeed = 1;
  scarySpaceMutant.maxSpeed = 2;
  scarySpaceMutant.friction = 0.02;
  scarySpaceMutants.add(scarySpaceMutant);
}

function mutantAttackMiner(scarySpaceMutant, miner){
  if(miners[0].shields <= 0){
    noLoop();
    text("GAME OVER",width/2, height/2);
    text("Miner 1 Is WINNER",width/2, height/2+100);
  } else if (miners[1].shields <= 0){
    noLoop();
    text("GAME OVER",width/2, height/2);
    text("Miner 1 Is WINNER",width/2, height/2+100);
  } else {
    miner.shields -= 100;
    scarySpaceMutant.remove();
    createScarySpaceMutant();
  }
}
function mutantAttackLlama(scarySpaceMutant, spaceLlama){
  scarySpaceMutant.scale += .01;
  spaceLlama.remove();
  createSpaceLlama();
}

// handles collisions between miners and debris
function debrisHit(miner, Debris){
  Debris.remove();
  miner.score += floor(random(25))+1;
  createObstacle(width - miner.position.x, height -miner.position.y);
  createDebris(1,random(width),random(height));
}

function bulletHit(scarySpaceMutant, bullet){
  bullet.remove();
  scarySpaceMutant.remove();
  console.log("MUTIE HIT");
}

function bulletHitMiner(miner, bullet){
  if(miner.shields < 1000)miner.shields -= 1;
  if(miner.score < 190 & miners.score > 0)miner.score -= 1;
}

// function obstacleHit
function obstacleHit(obstacle, miner){
  if(miners[0].shields <= 0){
    noLoop();
    text("GAME OVER",width/2, height/2);
    text("Miner 2 Is WINNER",width/2, height/2+100);
  } else if (miners[1].shields <= 0){
    noLoop();
    text("GAME OVER",width/2, height/2);
    text("Miner 1 Is WINNER",width/2, height/2+100);
  } else {
    miner.shields -= 100;
    obstacle.remove();
  }
}

// Miners Hit each other
function minersHit(miner, miner){
  for(var i = 0; i < miners.length; i++){
    if(miners[i].score >= 10) miners[i].score -= 10;
    miners[i].shields -= 100;
  }
}

function spaceLlamaHit(miner, spaceLlama){
  if(miner.shields < 1000)miner.shields = 1000;
  if(miner.score < 190)miner.score += 1;
  spaceLlama.remove();
  createSpaceLlama();
  createScarySpaceMutant();
}
