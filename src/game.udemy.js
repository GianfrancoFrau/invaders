function preload() {
  this.load.image('bug1', 'img/bug_1.png')
  this.load.image('bug2', 'img/bug_2.png')
  this.load.image('bug3', 'img/bug_3.png')
  this.load.image('platform', 'img/platform.png')
  this.load.image('player', 'img/codey.png')
}

const gameState = {
  score: 0
};

function create() {
  // Player
  gameState.player = this.physics.add.sprite(320, 300, 'player').setScale(.5);
  const platforms = this.physics.add.staticGroup();
  platforms.create(225, 510, 'platform');

  gameState.player.setCollideWorldBounds(true);
  this.physics.add.collider(gameState.player, platforms);

  // Cursors
  gameState.cursors = this.input.keyboard.createCursorKeys();

  // Nemici
  const bugs = this.physics.add.group();

  this.physics.add.collider(bugs, platforms, function (bug) {
    bug.destroy();
    gameState.score += 10;
    gameState.scoreText.setText(`Score: ${gameState.score}`);
  });

  function bugGen() {
    let xCoord = Math.random() * 450;
    bugs.create(xCoord, 10, 'bug1');
  }
  // bugGen();

  const bugGenLoop = this.time.addEvent({
    delay: 150,
    callback: bugGen,
    callbackScore: this,
    loop: true
  });

  // Score
  gameState.scoreText = this.add.text(195, 485, 'Score: 0', {
    fontSize: '15px',
    fill: '#000000'
  })

  this.physics.add.collider(gameState.player, bugs, () => {
    bugGenLoop.destroy();
    this.physics.pause();
    this.add.text(189, 250, 'Game Over', {
      fontSize: '15px',
      fill: '#000000'
    });
    this.add.text(152, 270, 'Click to Restart', {
      fontSize: '15px',
      fill: '#000000'
    });

    // On click
    this.input.on('pointerup', () => {
      gameState.score = 0;
      this.scene.restart();
    });
  });
}

function update() {
  // Far muovere il personaggio
  if (gameState.cursors.left.isDown) {
    gameState.player.setVelocityX(-160);
  } else if (gameState.cursors.right.isDown) {
    gameState.player.setVelocityX(160);
  } else {
    gameState.player.setVelocityX(0);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 450,
  height: 500,
  backgroundColor: "b9eaff",
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 200
      },
      enableBody: true,
    }
  },
  scene: {
    preload,
    create,
    update
  }
}

const game = new Phaser.Game(config)
