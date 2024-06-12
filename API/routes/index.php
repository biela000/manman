<?php

use Game\Game;

require_once __DIR__ . '/../classes/Game.php';
require_once(__DIR__ . '/../classes/Map.php');

//$map = new \Game\Map();
//$map->getMap();

$game = new Game();
$game->start();
