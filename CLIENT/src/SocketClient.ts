export default class SocketClient {
  private readonly socket: WebSocket;

  public constructor(onMessage: (event: MessageEvent) => void) {
    this.socket = new WebSocket('ws://127.0.0.1:46089/');
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onmessage = onMessage;
  }

  private onOpen(): void {
    console.log('Connected to server');
    // this.socket.send('UP');
  }

  public send(message: string): void {
    this.socket.send(message);
  }
}
