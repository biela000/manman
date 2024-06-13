import Player from './Player';

export type UpdateMessage = {
  type: 'UPDATE';
  payload: {
    players: Player[]
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
