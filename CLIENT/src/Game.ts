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
}
