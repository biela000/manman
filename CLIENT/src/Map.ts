import { POSSIBLE_BREAKABLE_WALL_POSITIONS } from './constants';
import animations from '../data/animations.json';

export default class Map {
  private readonly WIDTH = 31;

  private readonly HEIGHT = 13;

  private readonly BLOCK_SIZE = 32;

  private readonly BREAKABLE_WALL_COUNT = 10;

  private breakableWallPositions: Array<[number, number]> = [];

  private playerPosition: [number, number] = [0, 0];

  private balloonPositions: Array<[number, number]> = [];

  private ctx: CanvasRenderingContext2D;

  private spriteSheet: HTMLImageElement;

  public constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.spriteSheet = new Image();
    this.spriteSheet.src = '/spritesheet.png';
    this.generateBreakableWallPositions();
    this.spriteSheet.onload = () => {
      this.generateCanvasMap();
    };
    // this.generateBalloonPositions();
  }

  private generateBreakableWallPositions(): void {
    const possiblePositions = [...POSSIBLE_BREAKABLE_WALL_POSITIONS];
    for (let i = 0; i < this.BREAKABLE_WALL_COUNT; i += 1) {
      const randomIndex = Math.floor(
        Math.random() * possiblePositions.length,
      );
      this.breakableWallPositions.push(
        possiblePositions[randomIndex],
      );
      possiblePositions.splice(randomIndex, 1);
    }
  }

  public getBreakableWallPositions(): Array<[number, number]> {
    return this.breakableWallPositions;
  }

  public generateCanvasMap(): void {
    // Fill the whole canvas with green color
    this.ctx.fillStyle = 'green';
    this.ctx.fillRect(0, 0, this.WIDTH * this.BLOCK_SIZE, this.HEIGHT * this.BLOCK_SIZE);

    // Fill the top and bottom rows with unbreakable walls
    for (let i = 0; i < this.WIDTH; i += 1) {
      this.drawUnbreakableWall(i, 0);
      this.drawUnbreakableWall(i, this.HEIGHT - 1);
    }

    // Fill the left and right columns with unbreakable walls
    for (let i = 1; i < this.HEIGHT - 1; i += 1) {
      this.drawUnbreakableWall(0, i);
      this.drawUnbreakableWall(this.WIDTH - 1, i);
    }

    // Fill every remaining position with x and y even with unbreakable walls
    for (let y = 2; y < this.HEIGHT - 2; y += 2) {
      for (let x = 2; x < this.WIDTH - 2; x += 2) {
        this.drawUnbreakableWall(x, y);
      }
    }
  }

  private drawUnbreakableWall(x: number, y: number): void {
    this.ctx.drawImage(
      this.spriteSheet,
      animations.wall.unbreakable.x,
      animations.wall.unbreakable.y,
      animations.wall.unbreakable.width,
      animations.wall.unbreakable.height,
      x * this.BLOCK_SIZE,
      y * this.BLOCK_SIZE,
      this.BLOCK_SIZE,
      this.BLOCK_SIZE,
    );
  }
}
