export default class SocketClient {
  private readonly socket: WebSocket;

  public constructor() {
    this.socket = new WebSocket('ws://127.0.0.1:46089/');
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);
  }

  private onOpen(): void {
    console.log('Connected to server');
  }

  private onMessage(event: MessageEvent): void {
    console.log('Message received:', event.data);
  }
}
