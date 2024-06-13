import animations from '../data/animations.json';
import { PlayerPositionArray } from './types/Player';

export default class Map {
  private readonly WIDTH = 31;

  private readonly HEIGHT = 13;

  private readonly BLOCK_SIZE = 32;

  private readonly BREAKABLE_WALL_COUNT = 40;

  private breakableWallPositions: Array<[number, number]> = [];

  private playerPositions: PlayerPositionArray = [];

  private balloonPositions: Array<[number, number]> = [];

  private ctx: CanvasRenderingContext2D;

  private readonly spriteSheet: HTMLImageElement;

  private readonly baseMap: HTMLImageElement;

  public constructor(
    ctx: CanvasRenderingContext2D,
    spriteSheet: HTMLImageElement,
    baseMap: HTMLImageElement,
  ) {
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.baseMap = baseMap;
    // this.generateBalloonPositions();
  }

  public setBreakableWallPositions(breakableWallPositions: Array<[number, number]>): void {
    this.breakableWallPositions = [...breakableWallPositions];
  }

  public getBreakableWallPositions(): Array<[number, number]> {
    return this.breakableWallPositions;
  }

  public generateCanvasMap(): void {
    this.ctx.clearRect(0, 0, this.WIDTH * this.BLOCK_SIZE, this.HEIGHT * this.BLOCK_SIZE);
    this.ctx.drawImage(this.baseMap, 0, 0);
    this.drawBreakableWalls();
  }

  public setPlayerPositions(playerPositions: PlayerPositionArray): void {
    this.playerPositions = [...playerPositions];
  }

  public drawPlayers(): void {
    this.playerPositions.forEach(({ position }) => {
      this.ctx.drawImage(
        this.spriteSheet,
        animations.player.down.frames[1].x,
        animations.player.down.frames[1].y,
        animations.player.down.frames[1].width,
        animations.player.down.frames[1].height,
        position[0],
        position[1],
        this.BLOCK_SIZE,
        this.BLOCK_SIZE,
      );
    });
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
