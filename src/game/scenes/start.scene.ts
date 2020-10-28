export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartScene" });
  }

  // preload all game assets
  preload() {
    this.load.image("platform", "assets/platform.png");
    // Player is added as spritesheet composed of many sprites
    // we're assigning a size for each frame (32x48)
    this.load.spritesheet("player", "assets/dude_sprite.png", { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet("explosion", "assets/explosion.png", { frameWidth: 16, frameHeight: 16 });
    this.load.image("bullet", "assets/bullet.png");
    this.load.image("enemy1", "assets/e1.png");
    this.load.image("enemy2", "assets/e2.png");
    this.load.image("enemy3", "assets/e3.png");
  }

  create() {
    // Cameras, by default, are created the same size as your game, but their position and size can be set to anything.
    // https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html
    const x = this.cameras.main.centerX;
    const y = this.cameras.main.centerY;
    const startText = `
      SHOT THE BUGS
      \n\n
      LEFT - Move player to the left
      \n
      RIGHT - Move player to the right
      \n
      SPACE - Fire Bullet
      \n\n
      Click to start
    `;
    const text = this.add.text(x, y, startText, { color: "black", boundsAlignH: "center" });
    // Really center text
    text.setX(text.x - text.width / 2);
    text.setY(text.y - text.height / 2);
    this.input.once("pointerup", (pointer) => this.scene.start("MainScene"), this);
  }
}
