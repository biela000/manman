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
    }

    public function handleSocketMessage($client, $message): void
    {
        $player = $this->players[stream_socket_get_name($client, true)];

        switch ($message) {
            case 'UP':
                $player->moveUp();
                break;
            case 'DOWN':
                $player->moveDown();
                break;
            case 'LEFT':
                $player->moveLeft();
                break;
            case 'RIGHT':
                $player->moveRight();
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
        $this->server->sendMessage($clients, json_encode(
            [
                'players' => $this->players,
                'map' => $this->map->getMap()
            ]
        ));
    }
}