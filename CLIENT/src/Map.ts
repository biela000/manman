import { POSSIBLE_BREAKABLE_WALL_POSITIONS } from './constants';
import animations from '../data/animations.json';

export default class Map {
  private readonly WIDTH = 31;

  private readonly HEIGHT = 13;

  private readonly BLOCK_SIZE = 32;

  private readonly BREAKABLE_WALL_COUNT = 40;

  private breakableWallPositions: Array<[number, number]> = [];

  private playerPosition: [number, number] = [0, 0];

  private balloonPositions: Array<[number, number]> = [];

  private ctx: CanvasRenderingContext2D;

  private readonly spriteSheet: HTMLImageElement;

  private readonly baseMap: HTMLImageElement;

  public constructor(ctx: CanvasRenderingContext2D, spriteSheet: HTMLImageElement, baseMap: HTMLImageElement) {
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.baseMap = baseMap;
    this.generateBreakableWallPositions();
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
    this.ctx.drawImage(this.baseMap, 0, 0);
    this.drawBreakableWalls();
  }

  private drawBreakableWalls(): void {
    this.breakableWallPositions.forEach(([x, y]) => {
      this.ctx.drawImage(
        this.spriteSheet,
        animations.wall.breakable.x,
        animations.wall.breakable.y,
        animations.wall.breakable.width,
        animations.wall.breakable.height,
        x * this.BLOCK_SIZE,
        y * this.BLOCK_SIZE,
        this.BLOCK_SIZE,
        this.BLOCK_SIZE,
      );
    });
  }
}
