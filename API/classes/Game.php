<?php

namespace Game;

require_once __DIR__ . '/SocketServer.php';
require_once __DIR__ . '/Player.php';
require_once __DIR__ . '/Map.php';

class Game
{
    private const PLAYER_STARTING_POSITION = [32, 32];
    private array $players = [];
    private Map $map;
    private SocketServer $server;

    public function __construct()
    {
    }

    public function start()
    {
        $this->map = new Map();
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
                break;
            case 'DOWN':
                $player->moveDown($this->map);
                break;
            case 'LEFT':
                $player->moveLeft($this->map);
                break;
            case 'RIGHT':
                $player->moveRight($this->map);
                break;
            case 'BOMB':
                $player->placeBomb($this->map);
                break;
            default:
                break;
        }

        print_r($this->players);
    }

    public function handleSocketTick($clients): void
    {
        $serializedPlayers = [];

        foreach ($this->players as $player) {
            $serializedPlayers[$player->getIpAddress()] = $player->serialize();
        }

        $this->server->sendMessage($clients, json_encode(
            [
                'type' => 'UPDATE',
                'payload' => [
                    'players' => $serializedPlayers,
                    'map' => [
                        'raw' => $this->map->getRawMap(),
                        'breakableWallPositions' => $this->map->getBreakableWallPositions(),
                    ]
                ]
            ]
        ));
    }
}