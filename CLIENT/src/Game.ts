import SocketClient from './SocketClient';
import GameMap from './GameMap';
import SocketMessage from './types/SocketMessage';
import Player, { PlayerMapProps } from './types/Player.ts';
import Animation from './Animation.ts';
import animations from '../data/animations.json';

export default class Game {
  private socketClient: SocketClient | null = null;

  private map: GameMap | null = null;

  private clientIpAddress: string | null = null;

  private canSend: boolean = true;

  public constructor() {
    // Something's gonna be here i swear
  }

  public start() {
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const spriteSheet = new Image();
    spriteSheet.src = '/spritesheet.png';

    const baseMap = new Image();
    baseMap.src = '/map.png';

    spriteSheet.onload = () => {
      baseMap.onload = () => {
        this.map = new GameMap(ctx, spriteSheet, baseMap);
        this.map.generateCanvasMap();
      };
    };

    this.connect();
  }

  private connect() {
    this.socketClient = new SocketClient(this.onSocketMessage.bind(this));
  }

  private onSocketMessage(event: MessageEvent) {
    const message = JSON.parse(event.data) as SocketMessage;
    const { type, payload } = message;

    switch (type) {
      case 'CONNECTED':
        this.clientIpAddress = payload.ipAddress;
        this.bindKeys();
        break;
      case 'UPDATE':
        Object.entries(payload.players).forEach(([ipAddress, player]) => {
          if (!this.map?.animations[ipAddress]) {
            this.map!.animations[ipAddress] = { direction: 'DOWN', frame: 0 };
          }
        });

        payload.balloonMoves.forEach((direction, index) => {
          if (!this.map?.balloonAnimations[index]) {
            this.map!.balloonAnimations[index] = { direction, frame: 0 };
          }
        });

        this.map?.setBreakableWallPositions(payload.map.breakableWallPositions);
        this.map?.generateCanvasMap();

        const newPlayerProps = new Map<string, { position: [number, number], animation: Animation | undefined }>();
        Object.entries(payload.players).forEach(([ipAddress, player]) => {
          if (payload.playerMoves[ipAddress]) {
            if (this.map?.animations[ipAddress] && this.map.animations[ipAddress].direction !== payload.playerMoves[ipAddress]) {
              this.map!.animations[ipAddress].direction = payload.playerMoves[ipAddress];
              this.map!.animations[ipAddress].frame = 0;
            } else if (!this.map?.animations[ipAddress]) {
              this.map!.animations[ipAddress] = { direction: payload.playerMoves[ipAddress], frame: 0 };
            } else {
              this.map!.animations[ipAddress].frame++;
              if (this.map!.animations[ipAddress].frame >= 3) {
                this.map!.animations[ipAddress].frame = 0;
              }
            }
          }
          newPlayerProps.set(ipAddress, { position: [player.position[0], player.position[1]], animation: undefined });
        });

        // Handle balloon animations
        payload.balloonMoves.forEach((direction, index) => {
          if (!this.map?.balloonAnimations[index]) {
            this.map!.balloonAnimations[index] = { direction, frame: 0 };
          } else if (this.map?.balloonAnimations[index].direction !== direction) {
            this.map!.balloonAnimations[index].direction = direction;
            this.map!.balloonAnimations[index].frame = 0;
          } else {
            this.map!.balloonAnimations[index].frame++;
            if (this.map!.balloonAnimations[index].frame >= 3) {
              this.map!.balloonAnimations[index].frame = 0;
            }
          }
        });

        // If payload.placedBombs is an object, we need to convert it to an array
        if (typeof payload.placedBombs === 'object' && !Array.isArray(payload.placedBombs)) {
          payload.placedBombs = Object.values(payload.placedBombs);
        }

        payload.placedBombs.forEach((bomb) => {
          const bombIndex = this.map?.placedBombsFrames.findIndex((placedBomb) => placedBomb.position[0] === bomb.position[0] && placedBomb.position[1] === bomb.position[1]);
          if (bombIndex === -1) {
            this.map?.placedBombsFrames.push({ position: bomb.position, frame: 0 });
          } else {
            this.map!.placedBombsFrames[bombIndex!].frame++;
            if (this.map!.placedBombsFrames[bombIndex!].frame >= 3) {
              this.map!.placedBombsFrames[bombIndex!].frame = 0;
            }
          }
        });

        // If payload.bombExplosions is an object, we need to convert it to an array
        if (typeof payload.bombExplosions === 'object' && !Array.isArray(payload.bombExplosions)) {
          payload.bombExplosions = Object.values(payload.bombExplosions);
        }

        // Set the frame property for each bomb explosion
        payload.bombExplosions.forEach((explosion) => {
          const explosionIndex = this.map?.bombExplosions.findIndex((bombExplosion) => bombExplosion.position[0] === explosion.position[0] && bombExplosion.position[1] === explosion.position[1]);
          if (explosionIndex === -1) {
            this.map?.bombExplosions.push({ position: explosion.position, frame: 0 });
          } else {
            this.map!.bombExplosions[explosionIndex!].frame++;
            if (this.map!.bombExplosions[explosionIndex!].frame >= 4) {
              this.map!.bombExplosions[explosionIndex!].frame = 0;
            }
          }
        });

        this.map?.bombExplosions.forEach((bombExplosion, index) => {
          if (!payload.bombExplosions.find((explosion) => explosion.position[0] === bombExplosion.position[0] && explosion.position[1] === bombExplosion.position[1])) {
            this.map?.bombExplosions.splice(index, 1);
          }
        });

        console.log('EXPLOSIONS', payload.explodedWalls);

        this.map!.explodedWalls = payload.explodedWalls;
        this.map?.drawBombs(payload.placedBombs);
        this.map!.drawBombExplosions();
        this.map?.setPlayerProps(newPlayerProps);
        this.map?.drawPlayers();
        this.map?.setBalloons(payload.balloons);
        this.map?.drawBalloons();
        break;
      default:
        break;
    }
  }

  private bindKeys() {
    document.addEventListener('keydown', (event) => {
      if (!this.canSend) return;
      this.canSend = false;
      setTimeout(() => {
        this.canSend = true;
      }, 50);
      switch (event.key) {
        case 'ArrowUp':
          this.socketClient?.send('UP');
          break;
        case 'ArrowDown':
          this.socketClient?.send('DOWN');
          break;
        case 'ArrowLeft':
          this.socketClient?.send('LEFT');
          break;
        case 'ArrowRight':
          this.socketClient?.send('RIGHT');
          break;
        case 'x':
          this.socketClient?.send('BOMB');
          break;
        default:
          break;
      }
    });
  }
}
