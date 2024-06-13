export type PlayerPositions = Map<string, [number, number]>;

type Player = {
  id: string;
  ipAddress: string;
  position: [number, number];
  lastBombTimestamp: number;
};

export default Player;
