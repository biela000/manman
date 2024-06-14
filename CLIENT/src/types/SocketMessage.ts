import Player from './Player';

export type UpdateMessage = {
  type: 'UPDATE';
  payload: {
    players: { [key: string]: Player };
    balloons: Array<[number, number]>;
    playerMoves: { [key: string]: string };
    balloonMoves: string[];
    placedBombs: { position: [number, number], timestamp: number }[];
    bombExplosions: Array<{ position: [number, number], timestamp: number }>;
    explodedWalls: Array<[number, number]>;
    map: {
      raw: string[];
      breakableWallPositions: Array<[number, number]>;
    };
  }
};

export type ConnectedMessage = {
  type: 'CONNECTED';
  payload: {
    ipAddress: string;
  }
};

type SocketMessage = UpdateMessage | ConnectedMessage;

export default SocketMessage;
