import "phaser";
import StartScene from "./scenes/start.scene";
import MainScene from "./scenes/main.scene";
import EndScene from "./scenes/end.scene";

export const DEFAULTS = {
  WIDTH: 600,
  HEIGHT: 800,
  RESPONSIVE: false, // change this flag to enable/disable responsiveness
  GRAVITY: {
    Y: 0,
  },
  DEBUG: false,
  PLAYER: {
    VELOCITY: {
      X: 300,
      Y: 100,
    },
    HIT_ANIMATION_DURATION: 200,
    LIFE: 3,
  },
  BULLET: {
    POINT: 5,
    QUANTITY: 50, // preload bullets
    VELOCITY: {
      Y: 1000,
    },
    FIRERATE: 500,
    DISTANCE_FROM_PLAYER: 20,
  },
  ENEMIES: {
    BUG: {
      DAMAGE: 1,
      VELOCITY: {
        Y: 50,
      },
      DELAY: 1000, // generate enemy each 1000 ms
    },
  },
};

// Phaser Game Config https://photonstorm.github.io/phaser3-docs/Phaser.Core.Config.html
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: "#ffffff",
  scale: {
    parent: "game",
    width: DEFAULTS.WIDTH,
    height: DEFAULTS.HEIGHT,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: DEFAULTS.DEBUG,
      gravity: {
        y: DEFAULTS.GRAVITY.Y,
      },
    },
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
  if (DEFAULTS.RESPONSIVE) {
    resizeGame();
    window.addEventListener("resize", resizeGame);
  }
});
