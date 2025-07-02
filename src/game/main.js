import { AUTO, Game } from "phaser";
import { PreloaderScene } from "./scenes/PreloaderScene";
import { SplashScene } from "./scenes/SplashScene";
import { GameScene } from "./scenes/GameScene";

const GAME_HEIGHT = 1024;
const GAME_WIDTH = 1024;
const NUMBER_OF_ASTEROID_TYPES = 3;

const config = {
  type: AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game-container",
  backgroundColor: "#1e1e1e",
  physics: {
    default: "arcade",
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    new PreloaderScene(NUMBER_OF_ASTEROID_TYPES),
    new SplashScene(),
    new GameScene(GAME_HEIGHT, GAME_WIDTH, NUMBER_OF_ASTEROID_TYPES),
  ],
};

const StartGame = (parent) => {
  return new Game({ ...config, parent });
};

export default StartGame;
