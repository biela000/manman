<?php

namespace Game;

require_once __DIR__ . '/SocketServer.php';

class Game
{
    public function __construct()
    { }

    public function start() {
        $server = new SocketServer();
        $server->start();
    }
}