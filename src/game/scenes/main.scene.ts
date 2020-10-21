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
  point: 1,
  life: 5,
  damage: 1,
  score: 0,
  bullets: 3,
  nextFire: 0,
  destroyed: 0,
  fireRate: 400,
  startTime: 0,
  bulletDistance: 20,
};

const clone = (o) => JSON.parse(JSON.stringify(o));

export default class MainScene extends Phaser.Scene {
  private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private keys: Phaser.Types.Input.Keyboard.CursorKeys;
  private enemies: Phaser.Physics.Arcade.Group;
  private enemiesGenerator: Phaser.Time.TimerEvent;
  private bullets: Phaser.Physics.Arcade.Group;
  private iState;
  private menu: { [item: string]: Phaser.GameObjects.Text } = {};

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
    console.log("main.init");
    this.iState = clone(invadersState);
  }

  createMenu() {
    const fontSettings = { color: "black" };
    this.menu.score = this.add.text(0, 0, `Score: 0`, fontSettings);
    this.menu.life = this.add.text(150, 0, `Life: 0`, fontSettings);
    this.menu.destroyed = this.add.text(300, 0, `Kills: 0`, fontSettings);
    this.menu.bullets = this.add.text(450, 0, `Bullets: 0`, fontSettings);
  }

  generateRandomNumberBetween(min: number = 1, max: number = 10) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  create() {
    // Creation
    this.createMenu();
    this.player = this.physics.add.sprite(250, 735, "player");
    this.platforms = this.physics.add.staticGroup();
    this.keys = this.input.keyboard.createCursorKeys();
    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group({ defaultKey: "bullet", maxSize: this.iState.bullets });
    this.enemiesGenerator = this.time.addEvent({
      delay: 1000,
      callback: this.generateEnemies,
      callbackScope: this,
      loop: true,
    });

    // Setup
    this.player.setScale(0.7);
    this.player.setCollideWorldBounds(true);
    this.platforms.create(100, 800, "platform2");
    this.platforms.create(490, 800, "platform2");

    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms, (enemy) => enemy.destroy());
    this.physics.add.collider(this.player, this.enemies, (p, e) => {
      console.log("Damage!");
      this.iState.life -= this.iState.damage;
      if (this.iState.life === 0) {
        this.gameOver();
      }
      e.destroy();
    });
    this.physics.world.on("worldbounds", (item) => {
      console.log("onworldbounds", item);
      if (item && item.gameObject && item.gameObject.texture && item.gameObject.texture.key === "bullet") {
        // Disable body, deactivate game object, hide game object
        item.gameObject.disableBody(true, true);
        this.iState.bullets++;
      }
    });
  }

  update(time) {
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

    this.drawMenu();
  }

  drawMenu() {
    this.menu.score.setText(`Score: ${this.iState.score}`);
    this.menu.life.setText(`Life: ${this.iState.life}`);
    this.menu.destroyed.setText(`Destroyed: ${this.iState.destroyed}`);
    this.menu.bullets.setText(`Bullets: ${this.iState.bullets}`);
  }

  generateEnemies() {
    const x = this.generateRandomNumberBetween(30, 570);
    const y = 60;
    const velocity = this.iState.enemiesSpeed.y + this.generateRandomNumberBetween(this.iState.enemiesSpeed.y / 2, this.iState.enemiesSpeed.y * 1.5);
    const scale = 1 + this.generateRandomNumberBetween(0, 2);
    const enemyType = "enemy" + this.generateRandomNumberBetween(1, 3);
    console.log("enemy", { enemyType, x, y, scale, velocity });
    const enemy = this.enemies.create(x, y, enemyType);
    enemy.setScale(scale);
    enemy.setVelocityY(velocity);
  }

  fire() {
    if (this.time.now > this.iState.nextFire) {
      this.iState.nextFire = this.time.now + this.iState.fireRate;
      const distance = this.iState.bulletDistance;
      const coords = { x: this.player.x, y: this.player.y - distance };
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
        console.log("Fired bullets", this.iState.bullets);
        // Bullet - enemy collision
        this.physics.add.collider(this.enemies, bullet, (a, b) => {
          this.iState.score += this.iState.point;
          this.iState.destroyed++;
          this.iState.bullets++;
          console.log("Hit!");
          a.destroy();
          b.destroy();
        });
      }
    }
  }

  gameOver() {
    console.log("Game over", this.iState);
    this.enemiesGenerator.destroy();
    this.scene.stop();
    this.scene.start("EndScene", { ...this.iState });
  }
}
