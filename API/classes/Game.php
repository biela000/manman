<?php

namespace Game;

require_once __DIR__ . '/SocketServer.php';
require_once __DIR__ . '/Player.php';
require_once __DIR__ . '/Map.php';

class Game
{
    private const PLAYER_STARTING_POSITION = [32, 32];
    private array $players = [];
    private array $balloons = [];
    private Map $map;
    private SocketServer $server;
    private int $lastBalloonMoveTimestamp = 0;
    private array $playerMoves = [];
    private array $balloonMoves = [];
    private array $placedBombs = [];
    private array $bombExplosions = [];
    private array $explodedWalls = [];

    public function __construct()
    {
    }

    public function start()
    {
        $this->map = new Map();
        $this->balloons = $this->map->generateBalloons();
        $this->server = new SocketServer();
        $this->server->start([$this, 'handleSocketConnection'], [$this, 'handleSocketMessage'], [$this, 'handleSocketTick']);
    }

    public function handleSocketConnection($client): void
    {
        $player = new Player($client, self::PLAYER_STARTING_POSITION);
        $this->players[$player->getIpAddress()] = $player;

        $this->server->sendMessage([$client], json_encode(
            [
                'type' => 'CONNECTED',
                'payload' => [
                    'ipAddress' => $player->getIpAddress()
                ]
            ]
        ));
    }

    public function handleSocketMessage($client, $message): void
    {
        $player = $this->players[stream_socket_get_name($client, true)];

        switch ($message) {
            case 'UP':
                $player->moveUp($this->map);
                $this->playerMoves[$player->getIpAddress()] = 'UP';
                break;
            case 'DOWN':
                $player->moveDown($this->map);
                $this->playerMoves[$player->getIpAddress()] = 'DOWN';
                break;
            case 'LEFT':
                $player->moveLeft($this->map);
                $this->playerMoves[$player->getIpAddress()] = 'LEFT';
                break;
            case 'RIGHT':
                $player->moveRight($this->map);
                $this->playerMoves[$player->getIpAddress()] = 'RIGHT';
                break;
            case 'BOMB':
                $bombPosition = $player->placeBomb($this->map);
                if ($bombPosition === NULL) {
                    break;
                }
                $this->placedBombs[] = [
                    'position' => [$bombPosition[0], $bombPosition[1]],
                    'timestamp' => $bombPosition[2]
                ];
                break;
            default:
                break;
        }

        print_r($this->players);
    }

    public function handleSocketTick($clients): void
    {
        echo 'a';
        $serializedPlayers = [];

        foreach ($this->players as $player) {
            $serializedPlayers[$player->getIpAddress()] = $player->serialize();
        }

        $serializedBalloons = [];

        $balloonMoveTimestamp = floor(microtime(true) * 1000);
        $moving = false;

        foreach ($this->balloons as $index => $balloon) {
           if ($balloonMoveTimestamp - $this->lastBalloonMoveTimestamp > 50) {
                $direction = $balloon->move($this->map->getRawMap());
                // Assign balloon's index to the position
                $this->balloonMoves[$index] = $direction;
                $moving = true;
            }
            $serializedBalloons[] = $balloon->getPosition();
        }

        if ($moving) {
            $this->lastBalloonMoveTimestamp = $balloonMoveTimestamp;
        }

        // Handle killing differently later
        foreach ($this->players as $player) {
            foreach ($this->balloons as $balloon) {
                $playerPosition = $player->getPosition();
                $balloonPosition = $balloon->getPosition();

                if (abs($playerPosition[0] - $balloonPosition[0]) < 32 && abs($playerPosition[1] - $balloonPosition[1]) < 32) {
                    unset($this->players[$player->getIpAddress()]);
                }
            }
        }

        // Handle bomb explosion
        $bombExplosionTimestamp = floor(microtime(true) * 1000);
        echo "\n";
        echo "Placed bombs: BOMBACLAT \n";
        print_r($this->placedBombs);
        foreach ($this->placedBombs as $index => $bomb) {
            if ($bombExplosionTimestamp - $bomb['timestamp'] > 3000) {
                $bombPosition = $bomb['position'];
                $bombBlockPosition = [
                    $bombPosition[0] / 32,
                    $bombPosition[1] / 32
                ];

                $this->explodedWalls = $this->map->explodeBomb($bombBlockPosition);
                $this->bombExplosions[] = [
                    'position' => $bombPosition,
                    'timestamp' => floor(microtime(true) * 1000)
                ];
                unset($this->placedBombs[$index]);
            }
        }

        // Remove bomb explosions after 1s
        $bombExplosionTimestamp = floor(microtime(true) * 1000);
        foreach ($this->bombExplosions as $index => $bombExplosion) {
            if ($bombExplosionTimestamp - $bombExplosion['timestamp'] > 1000) {
                unset($this->bombExplosions[$index]);
            }
        }

        $this->server->sendMessage($clients, json_encode(
            [
                'type' => 'UPDATE',
                'payload' => [
                    'players' => $serializedPlayers,
                    'balloons' => $serializedBalloons,
                    'playerMoves' => $this->playerMoves,
                    'balloonMoves' => $this->balloonMoves,
                    'placedBombs' => $this->placedBombs,
                    'bombExplosions' => $this->bombExplosions,
                    'explodedWalls' => $this->explodedWalls,
                    'map' => [
                        'raw' => $this->map->getRawMap(),
                        'breakableWallPositions' => $this->map->getBreakableWallPositions(),
                    ]
                ]
            ]
        ));

        $this->playerMoves = [];
        $this->balloonMoves = [];
    }
}