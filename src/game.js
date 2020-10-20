const POINT = 10;
const FIRERATE = 400;
const DAMAGE = 5;
const LIFE = 50;
const playBtn = document.getElementById("play-btn");
const pauseBtn = document.getElementById("pause-btn");

const gameState = {
  state: {
    started: false,
    score: 0,
    life: LIFE,
    bulletsFired: 0,
    nextFire: 0,
    destroyed: 0,
  },
  settings: {
    fireRate: FIRERATE,
  },
};

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 600,
  height: 800,
  backgroundColor: "b9eaff",
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: {
        y: 5,
      },
      enableBody: true,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

function preload() {
  // this.load.image("dot1", "assets/dot.png");
  // this.load.image("dot2", "assets/dot2.png");
  this.load.image("bullet", "assets/bullet.png");
  this.load.image("enemy1", "assets/e1.png");
  this.load.image("enemy2", "assets/e2.png");
  this.load.image("enemy3", "assets/e3.png");
  this.load.image("platform", "assets/platform.png");
  this.load.image("platform2", "assets/platform2.png");
  this.load.image("player", "assets/player.png");
}

function create() {
  const player = this.physics.add.sprite(250, 735, "player").setScale(0.7);
  const platforms = this.physics.add.staticGroup();
  const cursors = this.input.keyboard.createCursorKeys();
  const enemies = this.physics.add.group();
  const bullets = this.physics.add.group({ defaultKey: "bullet", maxSize: 10 });

  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(50, "bullet");
  // bullets.setAll("checkWorldBounds", true);
  // bullets.setAll("outOfBoundsKill", true);

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  platforms.create(100, 800, "platform2");
  platforms.create(490, 800, "platform2");

  this.physics.add.collider(player, platforms);

  this.physics.add.collider(enemies, platforms, function (enemy) {
    enemy.destroy();
  });

  this.physics.add.collider(player, enemies, (p, e) => {
    console.log("Damage!", p, e);
    gameState.state.life -= DAMAGE;
    if (gameState.state.life === 0) {
      console.log("GAME OVER", gameState);
      enemiesGenerator.destroy();
      this.physics.pause();
    }
    e.destroy();
  });

  gameState.player = player;
  gameState.cursors = cursors;
  gameState.enemies = enemies;
  gameState.bullets = bullets;

  const enemiesGenerator = this.time.addEvent({
    delay: 2000,
    callback: generateEnemies,
    callbackScope: this, // callbackScope or callbackScore ?
    loop: true,
  });

  console.log("create", gameState);
}

function generateEnemies() {
  const x = Math.random() * 450;
  const y = 10;
  const enemyType = "enemy1";
  gameState.enemies.create(x, y, enemyType);
}

function fire(game) {
  const player = gameState.player;
  if (game.time.now > gameState.state.nextFire) {
    gameState.state.nextFire = game.time.now + gameState.settings.fireRate;
    const bullet = gameState.bullets.get(player.x, player.y - 30);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      // bullet.body.velocity.y = -200;
      bullet.setVelocityY(-200);
      console.log("fire", gameState, game);

      game.physics.add.collider(gameState.enemies, bullet, function (a, b) {
        console.log("Hit!", a, b);
        gameState.state.score += POINT;
        gameState.state.destroyed++;
        a.destroy();
        b.destroy();
      });
    }
  }
}

function update() {
  draw(this);

  const keys = gameState.cursors;
  const p = gameState.player;
  if (keys.left.isDown) {
    p.setVelocityX(-160);
  } else if (keys.right.isDown) {
    p.setVelocityX(160);
  } else if (keys.space.isDown) {
    fire(this);
  } else {
    p.setVelocityX(0);
  }

  gameState.bullets.children.each(
    function (b) {
      if (b.active) {
        if (b.y < 0) {
          b.setActive(false);
        }
      }
    }.bind(this)
  );
}

function draw(game) {
  const uiEl = gameState.uiElement || document.getElementById("ui");
  uiEl.innerHTML = "";
  const data = {
    score: gameState.state.score,
    time: game.time.now,
    life: gameState.state.life,
    bulletsFired: gameState.state.bulletsFired,
  };
  Object.keys(data).map((prop) => {
    let div = document.createElement("div");
    div.innerHTML = `<p>${prop}: ${gameState.state[prop]}</p>`;
    uiEl.appendChild(div);
  });

  gameState.uiElement = uiEl;
}

function play() {
  pauseBtn.removeAttribute("disabled");
  playBtn.setAttribute("disabled", true);
  if (!gameState.state.started) {
    gameState.state.started = true;
    gameState.start = Date.now();
    gameState.game = new Phaser.Game(config);
  }
  gameState.game.paused = false;
}

function pause() {
  gameState.game.paused = true;
  playBtn.removeAttribute("disabled");
  pauseBtn.setAttribute("disabled", true);
}

function init() {
  console.log("init");
  playBtn.removeAttribute("disabled");
  playBtn.addEventListener("click", () => play());
  pauseBtn.addEventListener("click", () => pause());
}

init();
