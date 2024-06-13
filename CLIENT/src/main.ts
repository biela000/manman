import GameMap from './GameMap.ts';
import Game from './Game';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const spriteSheet = new Image();
spriteSheet.src = '/spritesheet.png';

const baseMap = new Image();
baseMap.src = '/map.png';

spriteSheet.onload = () => {
  baseMap.onload = () => {
    // Start the game
    const map = new GameMap(ctx, spriteSheet, baseMap);
    map.generateCanvasMap();

    const game = new Game();
    game.start();
  };
};
