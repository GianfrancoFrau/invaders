import { DEFAULTS } from "../game";

// A global "state" object that contains default game settings
const state = {
  life: 0,
  score: 0,
  nextFire: 0,
  destroyed: 0,
  startTime: 0,
};

// Object deep clone
const clone = (o) => JSON.parse(JSON.stringify(o));

export default class MainScene extends Phaser.Scene {
  private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private keys: Phaser.Types.Input.Keyboard.CursorKeys;
  private enemies: Phaser.Physics.Arcade.Group;
  private bugsGenerator: Phaser.Time.TimerEvent;
  private bullets: Phaser.Physics.Arcade.Group;
  private iState;
  private gameScore: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "MainScene" });
  }

  init() {
    // console.log('main.init');
    this.iState = clone(state);
    this.iState.life = DEFAULTS.PLAYER.LIFE;
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
    this.player = this.physics.add.sprite(250, 750, "player");
    this.platforms = this.physics.add.staticGroup();
    this.keys = this.input.keyboard.createCursorKeys();
    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group({ defaultKey: "bullet", maxSize: DEFAULTS.BULLET.QUANTITY });
    this.bugsGenerator = this.time.addEvent({
      delay: DEFAULTS.ENEMIES.BUG.DELAY,
      callback: this.generateBug,
      callbackScope: this,
      loop: true,
    });

    /*
      Objects setup
      allow the player to collide with world bounds
      create animations for the player (once created the animations gloabals and are available to all GameObjects)
      create an explosion animation
      create two platforms on which the player will move
    */
    this.player.setCollideWorldBounds(true);
    this.player.setFrame(4);
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "turn",
      frames: [{ key: "player", frame: 4 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "explode",
      frames: this.anims.generateFrameNumbers("explosion", { start: 0, end: 5 }),
      frameRate: 20,
      repeat: 0,
      hideOnComplete: true,
    });

    // Create a base and position in the center X of the game
    // Set displayWidth to cover entire game X
    const ground = this.platforms.create(Number(this.sys.game.config.width)/2, Number(this.sys.game.config.height), "platform"); // (x,y,sprite name)
    ground.displayWidth = this.sys.game.config.width;

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
      this.iState.life -= DEFAULTS.ENEMIES.BUG.DAMAGE;

      // add little animation when the player is damaged
      const tween = this.tweens.add({
        targets: this.player,
        alpha: {
          start: 0.2,
          from: 0.2,
          to: 1,
        },
        // repeat: 1, // repeat n times
        duration: DEFAULTS.PLAYER.HIT_ANIMATION_DURATION,
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
    });
  }

  // Phaser update loop
  update() {
    // Listen player input and move on left/right and fire
    if (this.keys.left?.isDown) {
      this.player.setVelocityX(-DEFAULTS.PLAYER.VELOCITY.X);
      this.player.anims.play("left", true);
    } else if (this.keys.right?.isDown) {
      this.player.setVelocityX(DEFAULTS.PLAYER.VELOCITY.X);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn", true);
    }
    // Jump
    // if (this.keys.up?.isDown && this.player.body.touching.down) {
    //   this.player.setVelocityY(-DEFAULTS.PLAYER.VELOCITY.Y);
    // }
    if (this.keys.space?.isDown) {
      this.fire();
    }
    this.updateMenu();
  }

  // Generates one bug with random properties
  generateBug() {
    const x = this.generateRandomNumberBetween(30, 570);
    const y = 60;
    const speedY = DEFAULTS.ENEMIES.BUG.VELOCITY.Y;
    const velocity = speedY + this.generateRandomNumberBetween(speedY / 2, speedY * 1.5);
    const enemyType = "enemy" + this.generateRandomNumberBetween(1, 3);
    const enemy = this.enemies.create(x, y, enemyType);
    enemy.setVelocityY(velocity);
    // console.log("enemy", { enemy, enemyType, x, y, velocity });
  }

  // Fire a bullet
  fire() {
    // change fireRate and bullets to improve shot frequency
    if (this.time.now > this.iState.nextFire) {
      this.iState.nextFire = this.time.now + DEFAULTS.BULLET.FIRERATE;
      const distance = DEFAULTS.BULLET.DISTANCE_FROM_PLAYER;
      const coords = { x: this.player.x, y: this.player.y - distance };
      this.fireBullet(coords.x, coords.y);
    }
  }

  fireBullet(x: number, y: number) {
    // get a bullet item and place on the given coordinates
    const bullet = this.bullets.get(x, y);
    if (bullet) {
      if (!bullet.body.enable) {
        bullet.enableBody();
      }
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-DEFAULTS.BULLET.VELOCITY.Y);
      // Turn on wall collision
      bullet.setCollideWorldBounds(true);
      // Allows to listen to the 'worldbounds' event
      bullet.body.onWorldBounds = true;
      // Bullet - enemy collision
      this.physics.add.collider(this.enemies, bullet, (
        bullet: any /*Phaser.Types.Physics.Arcade.GameObjectWithBody*/,
        enemy: any /*Phaser.Types.Physics.Arcade.GameObjectWithBody*/
      ) => {
        this.iState.score += DEFAULTS.BULLET.POINT;
        this.iState.destroyed++;

        // console.log("Hit", bullet.texture.key, enemy.texture.key, { enemy, bullet });

        const x = enemy.x;
        const y = enemy.y;
        bullet.destroy();
        enemy.destroy();
        const explosion = this.physics.add.sprite(x, y, "explosion");
        explosion.play("explode");
        // Optional: listen to explode "animationcomplete"
        // explosion.on("animationcomplete", (animation, frame) => {
        //   if (animation.key === "explode") {
        //     console.log({ animation, frame }, explosion);
        //   }
        // });
      });
    }
  }

  gameOver() {
    // console.log("Game over", this.iState);
    // destroy the enemies generator loop
    this.bugsGenerator.destroy();
    // stop this scene and go to the final scene passing the score
    this.scene.stop();
    this.scene.start("EndScene", { score: this.iState.score });
  }
}
