export default interface Player {
  id: string;
  ipAddress: string;
  position: [number, number];
  lastBombTimestamp: number;
}
