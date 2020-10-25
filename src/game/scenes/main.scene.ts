// A global "state" object that contains default game settings
const invadersState = {
  playerSpeed: {
    x: 300,
    y: 100,
  },
  bulletSpeed: {
    x: 400,
    y: 800,
  },
  enemiesSpeed: {
    y: 50,
  },
  point: 5,
  life: 3,
  damage: 1,
  score: 0,
  bullets: 3,
  nextFire: 0,
  destroyed: 0,
  fireRate: 400,
  startTime: 0,
  bulletDistance: 20,
  enemiesGeneratorDelay: 1000,
};
// Object deep clone
const clone = (o) => JSON.parse(JSON.stringify(o));

export default class MainScene extends Phaser.Scene {
  private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private keys: Phaser.Types.Input.Keyboard.CursorKeys;
  private enemies: Phaser.Physics.Arcade.Group;
  private enemiesGenerator: Phaser.Time.TimerEvent;
  private bullets: Phaser.Physics.Arcade.Group;
  private iState;
  private gameScore: Phaser.GameObjects.Text;

  // Apply custom config for this scene that will override global game config
  constructor() {
    super({
      key: "MainScene",
      physics: {
        default: "arcade",
        arcade: {
          gravity: {
            y: 100,
          },
        },
      },
    });
  }

  init() {
    // console.log("main.init");
    this.iState = clone(invadersState);
  }

  getGameScore(score, destroyed, life): string {
    return `Score: ${score}\t\t\t\tKills: ${destroyed}\t\t\t\tLife: ${life}`;
  }

  // Display game score
  createMenu() {
    const fontSettings = { color: "black" };
    this.gameScore = this.add.text(0, 0, this.getGameScore(0, 0, 0), fontSettings);
  }

  // Update game score
  updateMenu() {
    this.gameScore.setText(this.getGameScore(this.iState.score, this.iState.destroyed, this.iState.life));
  }

  // generate a random number between [min,max]
  generateRandomNumberBetween(min: number = 1, max: number = 10) {
    return Phaser.Math.Between(min, max);
  }

  // Create Phaser GameObject instances
  create() {
    /*
      draw the game menu
      create the player image
      create the game platform
      a keys object for listeing player input
      a group of bullets that the player will fire
      a "generateEnemies" function that will be executed how set in "enemiesGeneratorDelay"
    */
    this.createMenu();
    this.player = this.physics.add.sprite(250, 735, "player");
    this.platforms = this.physics.add.staticGroup();
    this.keys = this.input.keyboard.createCursorKeys();
    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group({ defaultKey: "bullet", maxSize: this.iState.bullets });
    this.enemiesGenerator = this.time.addEvent({
      delay: this.iState.enemiesGeneratorDelay,
      callback: this.generateEnemy,
      callbackScope: this,
      loop: true,
    });

    /* 
      Objects setup
      allow the player to collide with world bounds
      create two platforms on which the player will move
    */
    this.player.setCollideWorldBounds(true);
    this.platforms.create(0, 800, "platform"); // (x,y,sprite name)
    this.platforms.create(500, 800, "platform");

    /* 
      Collisions
      allow the player collide with platforms
      allow enemies collide with platforms and destroy them when this happens
      allow player collide with enemies and reduce player life
        life = 0 => game over
        destroy enemy when collides with the player
    */
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms, (enemy) => enemy.destroy());
    this.physics.add.collider(this.player, this.enemies, (p, e) => {
      // console.log("Damage!");
      this.iState.life -= this.iState.damage;

      // add little animation when the player is damaged
      const tween = this.tweens.add({
        targets: this.player,
        alpha: {
          start: 0.2,
          from: 0.2,
          to: 1,
        },
        // repeat: 1, // repeat n times
        duration: 200,
        onComplete: () => {
          tween.stop();
        },
      });

      if (this.iState.life === 0) {
        this.gameOver();
      }
      e.destroy();
    });
    /*
      We have to listen to when a bullet collides with world buonds
      and deactivate the bullet body to make it reusable
    */
    this.physics.world.on("worldbounds", (item) => {
      // Disable body, deactivate game object, hide game object
      item.gameObject.disableBody(true, true);
      this.iState.bullets++;
    });
  }

  // Phaser update loop
  update() {
    // Listen player input and move on left/right and fire
    if (this.keys.left?.isDown) {
      this.player.setVelocityX(-this.iState.playerSpeed.x);
    } else if (this.keys.right?.isDown) {
      this.player.setVelocityX(this.iState.playerSpeed.x);
    } else {
      this.player.setVelocityX(0);
    }
    if (this.keys.space?.isDown) {
      this.fire();
    }
    this.updateMenu();
  }

  // Generates one enemy with random properties
  generateEnemy() {
    const x = this.generateRandomNumberBetween(30, 570);
    const y = 60;
    const velocity = this.iState.enemiesSpeed.y + this.generateRandomNumberBetween(this.iState.enemiesSpeed.y / 2, this.iState.enemiesSpeed.y * 1.5);
    const scale = 1 + this.generateRandomNumberBetween(0, 2);
    const enemyType = "enemy" + this.generateRandomNumberBetween(1, 3);
    const enemy = this.enemies.create(x, y, enemyType);
    enemy.setScale(scale);
    enemy.setVelocityY(velocity);
    // console.log("enemy", { enemy, enemyType, x, y, scale, velocity });
  }

  // Fire a bullet
  fire() {
    // change fireRate and bullets to improve shot frequency
    if (this.time.now > this.iState.nextFire && this.iState.bullets > 0) {
      this.iState.nextFire = this.time.now + this.iState.fireRate;
      const distance = this.iState.bulletDistance;
      const coords = { x: this.player.x, y: this.player.y - distance };
      // get a bullet item and place on the given coordinates
      const bullet = this.bullets.get(coords.x, coords.y);
      if (bullet) {
        if (!bullet.body.enable) {
          bullet.enableBody();
        }
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocityY(-this.iState.bulletSpeed.y);
        // Turn on wall collision
        bullet.setCollideWorldBounds(true);
        // Allows to listen to the 'worldbounds' event
        bullet.body.onWorldBounds = true;
        this.iState.bullets--;
        // console.log("Fired bullets", this.iState.bullets);
        // Bullet - enemy collision
        this.physics.add.collider(this.enemies, bullet, (a, b) => {
          this.iState.score += this.iState.point;
          this.iState.destroyed++;
          this.iState.bullets++;
          a.destroy();
          b.destroy();
          // console.log("Hit!");
        });
      }
    }
  }

  gameOver() {
    // console.log("Game over", this.iState);
    // destroy the enemies generator loop
    this.enemiesGenerator.destroy();
    // stop this scene and go to the final scene passing the score
    this.scene.stop();
    this.scene.start("EndScene", { score: this.iState.score });
  }
}
