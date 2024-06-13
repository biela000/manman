import SocketClient from './SocketClient';
import Map from './Map';

export default class Game {
  private socketClient: SocketClient | null = null;

  private map: Map | null = null;

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
        this.map = new Map(ctx, spriteSheet, baseMap);
        this.map.generateCanvasMap();
      };
    };

    this.connect();
  }

  private connect() {
    this.socketClient = new SocketClient(this.onSocketMessage.bind(this));
  }

  private onSocketMessage(event: MessageEvent) {
    const message = JSON.parse(event.data);
    const { type, payload } = message;

    switch (type) {
      case 'UPDATE':
        console.log('Payload map');
        console.log(payload.map);
        this.map?.setBreakableWallPositions(payload.map.breakableWallPositions);
        this.map?.generateCanvasMap();
        break;
      default:
        break;
    }
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
