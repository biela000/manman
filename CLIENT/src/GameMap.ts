import animations from '../data/animations.json';
import Player, { PlayerMapProps } from './types/Player';
import Animation, { Frame } from './Animation.ts';

export default class GameMap {
  private readonly WIDTH = 31;

  private readonly HEIGHT = 13;

  private readonly BLOCK_SIZE = 32;

  private readonly BREAKABLE_WALL_COUNT = 40;

  private breakableWallPositions: Array<[number, number]> = [];

  private playerProps: PlayerMapProps = new Map<string, { position: [number, number], animation: Animation }>();

  private balloonPositions: Array<[number, number]> = [];

  private ctx: CanvasRenderingContext2D;

  private readonly spriteSheet: HTMLImageElement;

  private readonly baseMap: HTMLImageElement;

  public animations: { [key: string]: { direction: string, frame: number } } = {};

  public balloonAnimations: { direction: string, frame: number }[] = [];

  public placedBombsFrames: Array<{ position: [number, number], frame: number, timestamp: number }> = [];

  public bombExplosions: Array<{ position: [number, number], frame: number }> = [];

  public explodedWalls: Array<[number, number]> = [];

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
    // if breakableWallPositions is an object, convert it to an array
    if (typeof breakableWallPositions === 'object' && !Array.isArray(breakableWallPositions)) {
      breakableWallPositions = Object.values(breakableWallPositions);
    }
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

  public setPlayerProps(playerProps: PlayerMapProps): void {
    this.playerProps = playerProps;
  }

  public getPlayerProps(): PlayerMapProps {
    return this.playerProps;
  }

  public drawPlayers(): void {
    this.playerProps.forEach(({ position }, ipAddress) => {
      this.drawPlayer(ipAddress, position);
    });
  }

  public drawPlayer(ipAddress: string, position: [number, number]): void {
    this.ctx.drawImage(
      this.spriteSheet,
      // @ts-ignore
      animations.player[this.animations[ipAddress].direction.toLowerCase()].frames[this.animations[ipAddress].frame].x,
      // @ts-ignore
      animations.player[this.animations[ipAddress].direction.toLowerCase()].frames[this.animations[ipAddress].frame].y,
      // @ts-ignore
      animations.player[this.animations[ipAddress].direction.toLowerCase()].frames[this.animations[ipAddress].frame].width,
      // @ts-ignore
      animations.player[this.animations[ipAddress].direction.toLowerCase()].frames[this.animations[ipAddress].frame].height,
      position[0],
      position[1],
      this.BLOCK_SIZE,
      this.BLOCK_SIZE,
    );
  }

  public setBalloons(balloonPositions: Array<[number, number]>): void {
    this.balloonPositions = [...balloonPositions];
  }

  public drawBalloons(): void {
    this.balloonPositions.forEach(([x, y], index) => {
      if (!this.balloonAnimations[index]) {
        this.balloonAnimations[index] = { direction: 'UP', frame: 0 };
      }
      this.ctx.drawImage(
        this.spriteSheet,
        // @ts-ignore
        animations.balloon[this.balloonAnimations[index].direction.toLowerCase()].frames[this.balloonAnimations[index].frame].x,
        // @ts-ignore
        animations.balloon[this.balloonAnimations[index].direction.toLowerCase()].frames[this.balloonAnimations[index].frame].y,
        // @ts-ignore
        animations.balloon[this.balloonAnimations[index].direction.toLowerCase()].frames[this.balloonAnimations[index].frame].width,
        // @ts-ignore
        animations.balloon[this.balloonAnimations[index].direction.toLowerCase()].frames[this.balloonAnimations[index].frame].height,
        x,
        y,
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

  public drawBombs(bombs: Array<{ position: [number, number], timestamp: number }>): void {
    bombs.forEach(({ position }, index) => {
      // Find placedBombFrame of the same position
      const bombIndex = this.placedBombsFrames.findIndex((placedBomb) => placedBomb.position[0] === position[0] && placedBomb.position[1] === position[1]);
      if (bombIndex === -1) {
        return;
      }
      const placedBombFrame = this.placedBombsFrames[bombIndex!];
      this.ctx.drawImage(
        this.spriteSheet,
        animations.bomb.frames[placedBombFrame.frame].x,
        animations.bomb.frames[placedBombFrame.frame].y,
        animations.bomb.frames[placedBombFrame.frame].width,
        animations.bomb.frames[placedBombFrame.frame].height,
        position[0],
        position[1],
        this.BLOCK_SIZE,
        this.BLOCK_SIZE,
      );
    });
  }

  public drawBombExplosions(): void {
    console.log(this.explodedWalls);
    this.bombExplosions.forEach(({ position, frame }) => {
      this.ctx.drawImage(
        this.spriteSheet,
        animations.explosion.center.frames[frame].x,
        animations.explosion.center.frames[frame].y,
        animations.explosion.center.frames[frame].width,
        animations.explosion.center.frames[frame].height,
        position[0],
        position[1],
        this.BLOCK_SIZE,
        this.BLOCK_SIZE,
      );

      if (this.explodedWalls.find(([x, y]) => x === position[0] / this.BLOCK_SIZE - 1 && y === position[1] / this.BLOCK_SIZE)) {
        // Play animation of wall breaking
        let animationFrame = 0;
        const animationInterval = setInterval(() => {
          this.ctx.drawImage(
            this.spriteSheet,
            animations.wall.breaking.frames[animationFrame].x,
            animations.wall.breaking.frames[animationFrame].y,
            animations.wall.breaking.frames[animationFrame].width,
            animations.wall.breaking.frames[animationFrame].height,
            position[0] - this.BLOCK_SIZE,
            position[1],
            this.BLOCK_SIZE,
            this.BLOCK_SIZE,
          );
          animationFrame++;

          if (animationFrame >= 6) {
            clearInterval(animationInterval);
          }
        }, 1000 / 6);
      } else {
        this.ctx.drawImage(
          this.spriteSheet,
          animations.explosion.horizontal.left.close.frames[frame].x,
          animations.explosion.horizontal.left.close.frames[frame].y,
          animations.explosion.horizontal.left.close.frames[frame].width,
          animations.explosion.horizontal.left.close.frames[frame].height,
          position[0] - this.BLOCK_SIZE,
          position[1],
          this.BLOCK_SIZE,
          this.BLOCK_SIZE,
        );
      }

      if (this.explodedWalls.find(([x, y]) => x === position[0] / this.BLOCK_SIZE + 1 && y === position[1] / this.BLOCK_SIZE)) {
        // Play animation of wall breaking
        let animationFrame = 0;
        const animationInterval = setInterval(() => {
          this.ctx.drawImage(
            this.spriteSheet,
            animations.wall.breaking.frames[animationFrame].x,
            animations.wall.breaking.frames[animationFrame].y,
            animations.wall.breaking.frames[animationFrame].width,
            animations.wall.breaking.frames[animationFrame].height,
            position[0] + this.BLOCK_SIZE,
            position[1],
            this.BLOCK_SIZE,
            this.BLOCK_SIZE,
          );
          animationFrame++;

          if (animationFrame >= 6) {
            clearInterval(animationInterval);
          }
        }, 1000 / 6);
      } else {
        this.ctx.drawImage(
          this.spriteSheet,
          animations.explosion.horizontal.right.close.frames[frame].x,
          animations.explosion.horizontal.right.close.frames[frame].y,
          animations.explosion.horizontal.right.close.frames[frame].width,
          animations.explosion.horizontal.right.close.frames[frame].height,
          position[0] + this.BLOCK_SIZE,
          position[1],
          this.BLOCK_SIZE,
          this.BLOCK_SIZE,
        );
      }

      if (this.explodedWalls.find(([x, y]) => x === position[0] / this.BLOCK_SIZE && y === position[1] / this.BLOCK_SIZE - 1)) {
        // Play animation of wall breaking
        let animationFrame = 0;
        const animationInterval = setInterval(() => {
          this.ctx.drawImage(
            this.spriteSheet,
            animations.wall.breaking.frames[animationFrame].x,
            animations.wall.breaking.frames[animationFrame].y,
            animations.wall.breaking.frames[animationFrame].width,
            animations.wall.breaking.frames[animationFrame].height,
            position[0],
            position[1] - this.BLOCK_SIZE,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE,
          );
          animationFrame++;

          if (animationFrame >= 6) {
            clearInterval(animationInterval);
          }
        }, 1000 / 6);
      } else {
        this.ctx.drawImage(
          this.spriteSheet,
          animations.explosion.vertical.top.close.frames[frame].x,
          animations.explosion.vertical.top.close.frames[frame].y,
          animations.explosion.vertical.top.close.frames[frame].width,
          animations.explosion.vertical.top.close.frames[frame].height,
          position[0],
          position[1] - this.BLOCK_SIZE,
          this.BLOCK_SIZE,
          this.BLOCK_SIZE,
        );
      }

      if (this.explodedWalls.find(([x, y]) => x === position[0] / this.BLOCK_SIZE && y === position[1] / this.BLOCK_SIZE + 1)) {
        // Play animation of wall breaking
        let animationFrame = 0;
        const animationInterval = setInterval(() => {
          this.ctx.drawImage(
            this.spriteSheet,
            animations.wall.breaking.frames[animationFrame].x,
            animations.wall.breaking.frames[animationFrame].y,
            animations.wall.breaking.frames[animationFrame].width,
            animations.wall.breaking.frames[animationFrame].height,
            position[0],
            position[1] + this.BLOCK_SIZE,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE,
          );
          animationFrame++;

          if (animationFrame >= 6) {
            clearInterval(animationInterval);
          }
        }, 1000 / 6);
      } else {
        this.ctx.drawImage(
          this.spriteSheet,
          animations.explosion.vertical.bottom.close.frames[frame].x,
          animations.explosion.vertical.bottom.close.frames[frame].y,
          animations.explosion.vertical.bottom.close.frames[frame].width,
          animations.explosion.vertical.bottom.close.frames[frame].height,
          position[0],
          position[1] + this.BLOCK_SIZE,
          this.BLOCK_SIZE,
          this.BLOCK_SIZE,
        );
      }

      // Now the same for far frames
      if (this.explodedWalls.find(([x, y]) => x === position[0] / this.BLOCK_SIZE - 2 && y === position[1] / this.BLOCK_SIZE)) {
        let animationFrame = 0;
        const animationInterval = setInterval(() => {
          this.ctx.drawImage(
            this.spriteSheet,
            animations.wall.breaking.frames[animationFrame].x,
            animations.wall.breaking.frames[animationFrame].y,
            animations.wall.breaking.frames[animationFrame].width,
            animations.wall.breaking.frames[animationFrame].height,
            position[0] - 2 * this.BLOCK_SIZE,
            position[1],
            this.BLOCK_SIZE,
            this.BLOCK_SIZE,
          );
          animationFrame++;

          if (animationFrame >= 6) {
            clearInterval(animationInterval);
          }
        }, 1000 / 6);
      } else {
        this.ctx.drawImage(
          this.spriteSheet,
          animations.explosion.horizontal.left.far.frames[frame].x,
          animations.explosion.horizontal.left.far.frames[frame].y,
          animations.explosion.horizontal.left.far.frames[frame].width,
          animations.explosion.horizontal.left.far.frames[frame].height,
          position[0] - 2 * this.BLOCK_SIZE,
          position[1],
          this.BLOCK_SIZE,
          this.BLOCK_SIZE,
        );
      }

      if (this.explodedWalls.find(([x, y]) => x === position[0] / this.BLOCK_SIZE + 2 && y === position[1] / this.BLOCK_SIZE)) {
        let animationFrame = 0;
        const animationInterval = setInterval(() => {
          this.ctx.drawImage(
            this.spriteSheet,
            animations.wall.breaking.frames[animationFrame].x,
            animations.wall.breaking.frames[animationFrame].y,
            animations.wall.breaking.frames[animationFrame].width,
            animations.wall.breaking.frames[animationFrame].height,
            position[0] + 2 * this.BLOCK_SIZE,
            position[1],
            this.BLOCK_SIZE,
            this.BLOCK_SIZE,
          );
          animationFrame++;

          if (animationFrame >= 6) {
            clearInterval(animationInterval);
          }
        }, 1000 / 6);
      } else {
        this.ctx.drawImage(
          this.spriteSheet,
          animations.explosion.horizontal.right.far.frames[frame].x,
          animations.explosion.horizontal.right.far.frames[frame].y,
          animations.explosion.horizontal.right.far.frames[frame].width,
          animations.explosion.horizontal.right.far.frames[frame].height,
          position[0] + 2 * this.BLOCK_SIZE,
          position[1],
          this.BLOCK_SIZE,
          this.BLOCK_SIZE,
        );
      }

      if (this.explodedWalls.find(([x, y]) => x === position[0] / this.BLOCK_SIZE && y === position[1] / this.BLOCK_SIZE - 2)) {
        let animationFrame = 0;
        const animationInterval = setInterval(() => {
          this.ctx.drawImage(
            this.spriteSheet,
            animations.wall.breaking.frames[animationFrame].x,
            animations.wall.breaking.frames[animationFrame].y,
            animations.wall.breaking.frames[animationFrame].width,
            animations.wall.breaking.frames[animationFrame].height,
            position[0],
            position[1] - 2 * this.BLOCK_SIZE,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE,
          );
          animationFrame++;

          if (animationFrame >= 6) {
            clearInterval(animationInterval);
          }
        }, 1000 / 6);
      } else {
        this.ctx.drawImage(
          this.spriteSheet,
          animations.explosion.vertical.top.far.frames[frame].x,
          animations.explosion.vertical.top.far.frames[frame].y,
          animations.explosion.vertical.top.far.frames[frame].width,
          animations.explosion.vertical.top.far.frames[frame].height,
          position[0],
          position[1] - 2 * this.BLOCK_SIZE,
          this.BLOCK_SIZE,
          this.BLOCK_SIZE,
        );
      }

      if (this.explodedWalls.find(([x, y]) => x === position[0] / this.BLOCK_SIZE && y === position[1] / this.BLOCK_SIZE + 2)) {
        let animationFrame = 0;
        const animationInterval = setInterval(() => {
          this.ctx.drawImage(
            this.spriteSheet,
            animations.wall.breaking.frames[animationFrame].x,
            animations.wall.breaking.frames[animationFrame].y,
            animations.wall.breaking.frames[animationFrame].width,
            animations.wall.breaking.frames[animationFrame].height,
            position[0],
            position[1] + 2 * this.BLOCK_SIZE,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE,
          );
          animationFrame++;

          if (animationFrame >= 6) {
            clearInterval(animationInterval);
          }
        }, 1000 / 6);
      } else {
        this.ctx.drawImage(
          this.spriteSheet,
          animations.explosion.vertical.bottom.far.frames[frame].x,
          animations.explosion.vertical.bottom.far.frames[frame].y,
          animations.explosion.vertical.bottom.far.frames[frame].width,
          animations.explosion.vertical.bottom.far.frames[frame].height,
          position[0],
          position[1] + 2 * this.BLOCK_SIZE,
          this.BLOCK_SIZE,
          this.BLOCK_SIZE,
        );
      }
    });
  }
}
