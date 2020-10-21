export default class EndScene extends Phaser.Scene {
  
  private gameData;

  constructor() {
    super({ key: "EndScene" });
  }

  init(data) {
    console.log('end.init', data);
    this.gameData = data;
  }

  create() {
    const x = this.cameras.main.centerX;
    const y = this.cameras.main.centerY;
    const gameOverText = `
      Game Over\n\n
      Score: ${this.gameData.score}\n\n
      Click to restart
    `;
    const gameOver = this.add.text(x, y, gameOverText, { color: "black" });
    gameOver.setX(gameOver.x - gameOver.width / 2);
    gameOver.setY(gameOver.y - gameOver.height / 2);
    this.input.once(
      "pointerup",
      (pointer) => {
        this.scene.start('MainScene');
      },
      this
    );
  }
}
