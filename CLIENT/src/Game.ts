import SocketClient from './SocketClient';

export default class Game {
  private socketClient: SocketClient | null = null;

  public constructor() {
    // Something's gonna be here i swear
  }

  public start() {
    this.connect();
  }

  private connect() {
    this.socketClient = new SocketClient();
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
