import "phaser";
import StartScene from "./scenes/start.scene";
import MainScene from "./scenes/main.scene";
import EndScene from "./scenes/end.scene";

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 800;
const RESPONSIVE = true; // change this flag to enable/disable responsiveness

// Phaser Game Config https://photonstorm.github.io/phaser3-docs/Phaser.Core.Config.html
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: "#ffffff",
  scale: {
    parent: "game",
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  },
  scene: [StartScene, MainScene, EndScene],
};

let game;

window.addEventListener("load", () => {
  game = new Phaser.Game(config);

  // Resize Game canvas
  function resizeGame() {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const windowRatio = windowWidth / windowHeight;
    const gameRatio = game.config.width / game.config.height;

    if (windowRatio < gameRatio) {
      canvas.style.width = windowWidth + "px";
      canvas.style.height = windowWidth / gameRatio + "px";
    } else {
      canvas.style.width = windowHeight * gameRatio + "px";
      canvas.style.height = windowHeight + "px";
    }
  }

  // Ensure window has focus
  window.focus();

  // Resize game
  if (RESPONSIVE) {
    resizeGame();
    window.addEventListener("resize", resizeGame);
  }
});
