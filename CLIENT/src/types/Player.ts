import Animation from '../Animation';

export type PlayerMapProps = Map<string, { position: [number, number]; animation: Animation | undefined }>;

type Player = {
  id: string;
  ipAddress: string;
  position: [number, number];
  lastBombTimestamp: number;
};

export default Player;
