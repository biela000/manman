export type PlayerPositionArray = Array<{ ipAddress: string, position: [number, number] }>;

type Player = {
  id: string;
  ipAddress: string;
  position: [number, number];
  lastBombTimestamp: number;
};

export default Player;
