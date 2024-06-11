import Map from './Map';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const spriteSheet = new Image();
spriteSheet.src = '/spritesheet.png';

const baseMap = new Image();
baseMap.src = '/map.png';

spriteSheet.onload = () => {
  baseMap.onload = () => {
    // Start the game
    const map = new Map(ctx, spriteSheet, baseMap);
    map.generateCanvasMap();
  };
};
