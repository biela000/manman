import Map from './Map';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const map = new Map(ctx);
map.generateCanvasMap();
