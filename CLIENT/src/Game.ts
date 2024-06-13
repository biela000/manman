import SocketClient from './SocketClient';
import GameMap from './GameMap';
import SocketMessage from './types/SocketMessage';

export default class Game {
  private socketClient: SocketClient | null = null;

  private map: GameMap | null = null;

  private clientIpAddress: string | null = null;

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

    console.log(payload);

    switch (type) {
      case 'CONNECTED':
        this.clientIpAddress = payload.ipAddress;
        this.bindKeys();
        break;
      case 'UPDATE':
        this.map?.setBreakableWallPositions(payload.map.breakableWallPositions);
        this.map?.generateCanvasMap();

        const playerPositions = new Map<string, [number, number]>();
        Object.entries(payload.players).forEach(([ipAddress, player]) => {
          playerPositions.set(ipAddress, [player.position[0], player.position[1]]);
        });

        this.map?.setPlayerPositions(playerPositions);
        this.map?.drawPlayers();
        break;
      default:
        break;
    }

    console.log(this.clientIpAddress, this.map);
  }

  private bindKeys() {
    document.addEventListener('keydown', (event) => {
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
        default:
          break;
      }
    });
  }
}
