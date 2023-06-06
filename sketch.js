function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
    (s = h.s), (v = h.v), (h = h.h);
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

var grid = [];
var scl = 4;
var padding = 4;
var columns = 80;
var rows = 160;
var buff;
var t = 0;
var playerBlock;
var nextBlock;
var vis;
var fullLine;
var cleartime = 0;
var placed = false;
var staticCount = 0;

var linesCleared = 0;
var score = 0;

var gameOffset = 4 * scl;

var nextOffset;

var gameRes;

var placeSound;
var lineSound;
var gameMusic;

var pixelFont;

var gameOver = true;
var paused = true;

var startScreen;
var pauseScreen;
var aboutScreen;
var gameoverScreen;
var gameoverText;

var timeText = "00:00";

var levelSlider;
var levelText;
var difficulty = 1;

var sfxSlider1;
var sfxSlider2;

var musSlider1;
var musSlider2;

//difficulty vars
var speed = 0.5;
var staticChance = 8;
var dupChance = 0.5;

var brick = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 1, 0],
  [0, 1, 0, 2, 2, 0, 1, 0],
  [0, 1, 0, 2, 2, 0, 1, 0],
  [0, 1, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

var staticbrick = [
  [2, 0, 0, 0, 0, 0, 0, 2],
  [0, 1, 2, 1, 1, 2, 1, 0],
  [0, 2, 1, 1, 1, 1, 2, 0],
  [0, 1, 1, 0, 0, 1, 1, 0],
  [0, 1, 1, 0, 0, 1, 1, 0],
  [0, 2, 1, 1, 1, 1, 2, 0],
  [0, 1, 2, 1, 1, 2, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 2],
];

var cols = [
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
  [255, 255, 0],
  [255, 255, 255],
];

var blockType = [
  [
    [0, 0, 0, 1, 1, 0, 1, 1], // O rotations
    [0, 0, 0, 1, 1, 0, 1, 1],
    [0, 0, 0, 1, 1, 0, 1, 1],
    [0, 0, 0, 1, 1, 0, 1, 1],
  ],

  [
    [0, 0, 0, 1, 1, 0, 0, 2], // L rotations
    [0, 0, 1, 0, 2, 0, 2, 1],
    [0, 2, 1, 2, 1, 1, 1, 0],
    [0, 0, 0, 1, 1, 1, 2, 1],
  ],

  [
    [0, 0, 1, 0, 1, 1, 1, 2], // J rotations
    [0, 1, 1, 1, 2, 1, 2, 0],
    [0, 0, 0, 1, 0, 2, 1, 2],
    [0, 0, 0, 1, 1, 0, 2, 0],
  ],

  [
    [0, 0, 1, 0, 1, 1, 2, 1], // S rotations
    [0, 1, 0, 2, 1, 1, 1, 0],
    [0, 0, 1, 0, 1, 1, 2, 1],
    [0, 1, 0, 2, 1, 1, 1, 0],
  ],

  [
    [0, 1, 1, 1, 1, 0, 2, 0], // Z rotations
    [0, 0, 0, 1, 1, 1, 1, 2],
    [0, 1, 1, 1, 1, 0, 2, 0],
    [0, 0, 0, 1, 1, 1, 1, 2],
  ],

  [
    [0, 0, 1, 0, 2, 0, 1, 1], // T rotations
    [0, 1, 1, 0, 1, 1, 1, 2],
    [1, 0, 0, 1, 1, 1, 2, 1],
    [0, 0, 0, 1, 0, 2, 1, 1],
  ],

  [
    [0, 0, 1, 0, 2, 0, 3, 0], // I rotations
    [0, 0, 0, 1, 0, 2, 0, 3],
    [0, 0, 1, 0, 2, 0, 3, 0],
    [0, 0, 0, 1, 0, 2, 0, 3],
  ],
];

var blockWidth = [
  [1, 1, 1, 1],
  [1, 2, 1, 2],
  [1, 2, 1, 2],
  [2, 1, 2, 1],
  [2, 1, 2, 1],
  [2, 1, 2, 1],
  [3, 0, 3, 0],
];

var blockHeight = [
  [1, 1, 1, 1],
  [2, 1, 2, 1],
  [2, 1, 2, 1],
  [1, 2, 1, 2],
  [1, 2, 1, 2],
  [1, 2, 1, 2],
  [0, 3, 0, 3],
];

function preload() {
  soundFormats("mp3", "ogg");
  placeSound = loadSound("sounds/place");
  lineSound = loadSound("sounds/line");
  gameMusic = loadSound("sounds/music");
  pixelFont = loadFont("fonts/retroFont.ttf");
}

//block object
function Block(x, y) {
  this.pos = createVector(0, 0);
  this.grav = speed;
  this.sprite = null;
  this.grid = [];
  this.type = 0;
  this.col = 0;
  this.static = false;
  this.rot = 0;
  this.rotReset = true;

  this.clearGrid = function () {
    this.grid = [];
    for (let i = 0; i < 32; i++) {
      this.grid.push(new Array(32).fill(null));
    }
  };

  this.renderBlock = function () {
    this.clearGrid();
    AddBlock(
      this.grid,
      0,
      31,
      blockType[this.type][this.rot],
      this.col,
      this.static
    );
    renderFromArray(this.grid, this.sprite);
  };

  this.newBlock = function () {
    this.static = false;

    this.sprite = createImage(32, 32);
    this.type = int(random(blockType.length));
    this.col = int(random(4));
    this.pos = createVector(
      int(columns / 2 - (blockWidth[this.type][0] + 1)),
      0
    );

    staticCount += 1;
    if (staticCount == staticChance) {
      this.static = true;
      staticCount = 0;
    }

    this.renderBlock();
  };

  this.show = function () {
    image(
      this.sprite,
      this.pos.x * scl + gameOffset,
      (this.pos.y - 32) * scl,
      32 * scl,
      32 * scl
    );
  };

  this.update = function () {
    let gridx = Math.floor(this.pos.x);
    let gridy = Math.floor(this.pos.y);

    //check if block hit the ground
    if (gridy + 1 >= rows) {
      placed = true;
    } else {
      //check if sand under any block
      for (let i = 0; i < 4; i++) {
        let index = i * 2;
        let offx = blockType[this.type][this.rot][index];
        let offy = blockType[this.type][this.rot][index + 1];
        let brickx = int(gridx + offx * 8);
        let bricky = int(gridy - offy * 8);
        if (bricky <= 0) {
          continue;
        }

        for (let j = 0; j < 8; j++) {
          if (grid[bricky + 1][brickx + j] != null) {
            if (grid[bricky][brickx + j]) {
              this.pos.y -= 1;
            }
            placed = true;
          }
        }
      }
    }

    if (placed) {
      if (this.pos.y - 8 * (blockHeight[this.type][this.rot] + 1) < 0) {
        gameOver = true;
        gameOverScore();
        gameoverScreen.open = true;
      }
      AddBlock(
        grid,
        gridx,
        min(gridy, rows - 1),
        blockType[this.type][this.rot],
        this.col,
        this.static
      );
      placeSound.play();
      return;
    }

    this.pos.y += this.grav;
  };

  this.rotate = function () {
    this.rot = (this.rot + 1) % 4;
    this.clearGrid();
    this.sprite = createImage(32, 32);
    AddBlock(
      this.grid,
      0,
      31,
      blockType[this.type][this.rot],
      this.col,
      this.static
    );
    renderFromArray(this.grid, this.sprite);
    let limit = blockWidth[this.type][this.rot] + 1;
    if (this.pos.x > columns - limit * 8) {
      this.pos.x = columns - limit * 8;
    }
  };

  this.controls = function () {
    if (keyIsDown(UP_ARROW)) {
      if (this.rotReset) {
        this.rotate();
        this.rotReset = false;
      }
    } else {
      this.rotReset = true;
    }

    if (keyIsDown(LEFT_ARROW)) {
      this.pos.x -= 1;
      if (this.pos.x < 0) {
        this.pos.x = 0;
      }
    }

    if (keyIsDown(RIGHT_ARROW)) {
      this.pos.x += 1;
      let limit = blockWidth[this.type][this.rot] + 1;
      if (this.pos.x > columns - limit * 8) {
        this.pos.x = columns - limit * 8;
      }
    }

    if (keyIsDown(DOWN_ARROW)) {
      this.pos.y += 1;
      score += 1;
    }
  };
}

function resetGame() {
  //board has 10x20 blocks
  //and 80x160 grains
  score = 0;
  linesCleared = 0;
  staticCount = 0;
  t = 0;

  buff = createImage(columns, rows);
  grid = [];
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < columns; x++) {
      grid[y].push(null);
    }
  }

  playerBlock = new Block(width / 2 - gameOffset, 0);
  playerBlock.newBlock();

  nextBlock = new Block(width / 2 - gameOffset, 0);
  nextBlock.newBlock();
}

function startGame() {
  resetGame();
  paused = false;
  gameOver = false;
  startScreen.open = false;
}

function unpauseGame() {
  paused = false;
  pauseScreen.open = false;
}

function newGame() {
  pauseScreen.open = false;
  gameoverScreen.open = false;
  startScreen.open = true;
}

function SFXvolume(val) {
  let soundlevel = val / 10;
  placeSound.setVolume(soundlevel / 2);
  lineSound.setVolume(soundlevel / 2);
  sfxSlider1.value = val;
  sfxSlider2.value = val;
}

function MUSvolume(val) {
  let soundlevel = val / 10;
  gameMusic.setVolume(soundlevel / 2);
  musSlider1.value = val;
  musSlider2.value = val;
}

function toggleAbout() {
  aboutScreen.open = !aboutScreen.open;
  startScreen.open = !startScreen.open;
}

function adjustDifficulty() {
  difficulty = levelSlider.value;

  speed = 0.5 + map(difficulty, 1, 10, 0, 3) / 2;
  staticChance = Math.floor(map(difficulty, 1, 10, 16, 4));
  dupChance = map(difficulty, 0, 1, 1, 0.1);
}

function gameOverScore() {
  gameoverText.innerHTML = "";
  gameoverText.innerHTML += "SCORE:<br/>" + score;
  gameoverText.innerHTML += "<br/>LINES:<br/>" + linesCleared;
}

function shareText() {
  let scoreInfoText = `█▀ ▄▀█ █▄░█ █▀▄ ▀█▀ █▀█ █ █▀
▄█ █▀█ █░▀█ █▄▀ ░█░ █▀▄ █ ▄█
  `;
  let levelText = difficulty.toString();
  let linesText = linesCleared.toString();
  let scoreText = score.toString();
  scoreInfoText +=
    "LEVEL: " + levelText + " ".repeat(6 - levelText.length) + "| ";
  scoreInfoText +=
    "LINES: " + linesText + " ".repeat(6 - linesText.length) + "\n";
  scoreInfoText +=
    "SCORE: " + scoreText + " ".repeat(9 - scoreText.length) + "| ";
  scoreInfoText += "TIME: " + timeText + " ".repeat(7 - timeText.length) + "\n";

  scoreInfoText += "Play now at https://sandtris.com/";
  scoreInfoText += navigator.clipboard.writeText(scoreInfoText);
  alert("Share Text Copied to Clipboard!");
}

function setup() {
  //dom elements
  startScreen = document.getElementById("startpage");
  pauseScreen = document.getElementById("pausepage");
  gameoverScreen = document.getElementById("gameoverpage");
  aboutScreen = document.getElementById("aboutpage");

  levelSlider = document.getElementById("lvlSlider");
  levelSlider.value = 1;
  levelText = document.getElementById("levelText");

  sfxSlider1 = document.getElementById("sfx1Slider");
  sfxSlider2 = document.getElementById("sfx2Slider");
  sfxSlider1.value = 10;
  sfxSlider2.value = 10;

  musSlider1 = document.getElementById("mus1Slider");
  musSlider2 = document.getElementById("mus2Slider");
  musSlider1.value = 10;
  musSlider2.value = 10;

  gameoverText = document.getElementById("gameoverText");

  gameRes = createVector(columns * scl, rows * scl);
  nextOffset = gameRes.x + gameOffset * 4;
  cnv = createCanvas(gameRes.x + gameOffset * 17, gameRes.y);

  cnv.parent("cnv");
  textFont(pixelFont);
  frameRate(60);
  noSmooth();

  gameMusic.play();
  gameMusic.setVolume(0.5);
  gameMusic.loop();

  resetGame();
}

//adds 4 bricks to array in block form
function AddBlock(target, x, y, type, c, static) {
  for (let i = 0; i < 4; i++) {
    AddSingleBrick(
      target,
      x + type[i * 2] * 8,
      y - type[i * 2 + 1] * 8,
      c,
      static
    );
  }
}

//adds a single brick to array
function AddSingleBrick(target, x, y, c, static) {
  let template = brick;
  if (static) {
    template = staticbrick;
  }
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (y - i < 0) {
        continue;
      }
      let col = HSVtoRGB(c / 5, 0.8, map(template[i][j], 0, 1, 0.2, 0.7));
      //[Block Group, r,g,b, visited, STATIC]
      target[y - i][x + j] = [c, col.r, col.g, col.b, 0, static];
    }
  }
}

//renders image from given array
function renderFromArray(a, target) {
  let rows = a.length;
  let columns = a[0].length;
  target.loadPixels();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      let index = (y * columns + x) * 4;
      if (a[y][x] == null) {
        target.pixels[index] = 0;
        target.pixels[index + 1] = 0;
        target.pixels[index + 2] = 0;
        target.pixels[index + 3] = 0;
        continue;
      }

      target.pixels[index] = a[y][x][1];
      target.pixels[index + 1] = a[y][x][2];
      target.pixels[index + 2] = a[y][x][3];
      target.pixels[index + 3] = 255;
    }
  }
  target.updatePixels();
}

//resets and sand automata logic
function updateLogic(x, y) {
  if (grid[y][x] == null) {
    return;
  }

  //reset visited logic
  grid[y][x][4] = 0;

  //sand automata rules
  if (y >= rows - 1) {
    return;
  }

  //bottom empty
  if (grid[y + 1][x] == null) {
    grid[y + 1][x] = grid[y][x];
    grid[y][x] = null;
    return;
  }

  //check if static block
  if (grid[y][x][5]) {
    return;
  }

  //bottom corners
  let bl = x > 0 && grid[y + 1][x - 1] == null;
  let br = x < columns - 1 && grid[y + 1][x + 1] == null;
  if (bl && br) {
    if (random() < 0.5) {
      grid[y + 1][x - 1] = grid[y][x];
      grid[y][x] = null;
      return;
    }
    grid[y + 1][x + 1] = grid[y][x];
    grid[y][x] = null;
    return;
  }

  if (bl) {
    grid[y + 1][x - 1] = grid[y][x];
    grid[y][x] = null;
    return;
  }

  if (br) {
    grid[y + 1][x + 1] = grid[y][x];
    grid[y][x] = null;
    return;
  }
}

//alternates update loop l-r, r-l
function updateGrid() {
  if (t % 4 == 0) {
    //left to right half the time
    for (let y = rows - 1; y >= 0; y--) {
      for (let x = 0; x < columns; x++) {
        updateLogic(x, y);
      }
    }
    return;
  }
  if (t % 4 == 2) {
    //right to left half the time
    for (let y = rows - 1; y >= 0; y--) {
      for (let x = columns - 1; x >= 0; x--) {
        updateLogic(x, y);
      }
    }
  }
}

//checks if color goes from left to right
function checkLine() {
  //visited array
  vis = [];

  for (let y = 0; y < rows; y++) {
    vis = [];
    fullLine = false;
    if (grid[y][0] == null || grid[y][0][4] == 1) {
      continue;
    }
    floodFill(0, y, grid[y][0][0]);
    if (!fullLine) {
      continue;
    }
    console.log("LINE AT ", y);

    //breaks here to store vis and fullLine
    return;
  }
}

//helper for checkLine using floodFill
function floodFill(x, y, c) {
  if (
    x < 0 ||
    x >= columns ||
    y < 0 ||
    y >= rows ||
    grid[y][x] == null ||
    grid[y][x][4] == 1 ||
    grid[y][x][0] != c
  ) {
    return;
  }

  if (x == columns - 1) {
    fullLine = true;
  }
  //mark visited
  grid[y][x][4] = 1;
  vis.push([x, y]);

  //recurse to neighbors
  floodFill(x + 1, y, c);
  floodFill(x - 1, y, c);
  floodFill(x, y + 1, c);
  floodFill(x, y - 1, c);
}

function setLineColor(t) {
  let col = 255;
  if (t % 10 < 5) {
    col = 0;
  }
  for (let p of vis) {
    grid[p[1]][p[0]][1] = col;
    grid[p[1]][p[0]][2] = col;
    grid[p[1]][p[0]][3] = col;
  }
}

function deleteLine(p) {
  for (let p of vis) {
    grid[p[1]][p[0]] = null;
  }
  score += vis.length;
  vis = [];
}

function UI() {
  //render
  renderFromArray(grid, buff);

  //display
  background(206, 174, 127);
  //game background
  fill(10);
  rect(gameOffset, 0, columns * scl, rows * scl);
  //game image
  image(buff, gameOffset, 0, columns * scl, rows * scl);

  //current block show
  if (!gameOver && !placed) {
    playerBlock.show();
  }

  //next block background
  fill(10);
  rect(nextOffset, gameOffset * 2, gameOffset * 10, gameOffset * 10);
  //next block show
  image(
    nextBlock.sprite,
    nextOffset + (5 - (blockWidth[nextBlock.type][0] + 1)) * gameOffset,
    (5 - (6 - blockHeight[nextBlock.type][0]) + 1) * gameOffset,
    32 * scl,
    32 * scl
  );

  //show text
  let minutes = Math.floor(t / 3600);
  let seconds = Math.floor(t / 60) % 60;
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  timeText = minutes + ":" + seconds;
  fill(25).strokeWeight(1).textSize(32);
  text(timeText, nextOffset - 2, gameOffset * 16);
  text("LINES:", nextOffset - 2, gameOffset * 19);
  text(linesCleared, nextOffset - 2, gameOffset * 21);
  text("SCORE:", nextOffset - 2, gameOffset * 24);
  text(score, nextOffset - 2, gameOffset * 26);
  text("LEVEL:", nextOffset - 2, gameOffset * 29);
  text(difficulty, nextOffset - 2, gameOffset * 31);

  //DOM
  levelText.innerHTML = "LEVEL: " + levelSlider.value;
}

function keyPressed() {
  if (keyCode === 80) {
    if (gameOver) {
      return;
    }
    paused = !paused;
    pauseScreen.open = !pauseScreen.open;
  }
}

function GameLogic() {
  if (paused) {
    return;
  }
  if (gameOver) {
    return;
  }

  //check if line is made
  if (fullLine) {
    if (cleartime == 0) {
      linesCleared += 1;
      lineSound.play();
    }
    cleartime += 1;
    setLineColor(cleartime);
    if (cleartime > 30) {
      console.log("Deleting");
      deleteLine();
      cleartime = 0;
      fullLine = false;
    }
    return;
  }

  if (placed) {
    playerBlock = nextBlock;
    nextBlock = new Block(width / 2, 0);
    nextBlock.newBlock();

    if (playerBlock.col == nextBlock.col) {
      if (random() < dupChance) {
        nextBlock.col = (nextBlock.col + 1) % 4;
        nextBlock.renderBlock();
      }
    }

    placed = false;
  }

  //game logic
  updateGrid();
  playerBlock.update();
  playerBlock.controls();

  checkLine();

  t += 1;
}

function draw() {
  //show game
  UI();
  //run game logic
  GameLogic();
}
