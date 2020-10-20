import "phaser";
import StartScene from "./scenes/start.scene";
import MainScene from "./scenes/main.scene";

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 800;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: "#ffffff",
  scale: {
    parent: "game",
    // mode: Phaser.Scale.FIT,
    // autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  },
  scene: [StartScene, MainScene]
};

window.addEventListener("load", () => {
  const game = new Phaser.Game(config);
});
