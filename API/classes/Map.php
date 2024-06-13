<?php

namespace Game;

require_once(__DIR__ . '/../classes/constants.php');

enum Block: string
{
    case UNBREAKABLE_WALL = "#";
    case BREAKABLE_WALL = "x";
    case EMPTY = ' ';
    case BOMB = 'b';
    case EXPLOSION = 'e';
    case PLAYER = 'p';
    case POWER_UP = 'u';
    case BALLOON = 'o';
}

class Map
{
    private const WIDTH = 31;
    private const HEIGHT = 13;
    private const BLOCK_SIZE_PX = 32;
    private array $raw = BASE_MAP;
    private const BREAKABLE_WALL_COUNT = 40;
    private array $breakableWallPositions = [];

    public function __construct()
    {
        $this->generateBreakableWalls();
    }

    private function generateBreakableWalls(): void
    {
        $breakableWallCount = 0;
        $possibleBreakableWallPositions = POSSIBLE_BREAKABLE_WALL_POSITIONS;
        while ($breakableWallCount < self::BREAKABLE_WALL_COUNT) {
            $breakableWallPosition = $possibleBreakableWallPositions[array_rand($possibleBreakableWallPositions)];
            $x = $breakableWallPosition[0];
            $y = $breakableWallPosition[1];

            $this->raw[$y][$x] = Block::BREAKABLE_WALL->value;
            $breakableWallCount++;

            $this->breakableWallPositions[] = $breakableWallPosition;

            $possibleBreakableWallPositions = array_filter($possibleBreakableWallPositions, function ($position) use ($x, $y) {
                return $position[0] !== $x || $position[1] !== $y;
            });
        }
    }

    public function getRawMap(): array {
        return $this->raw;
    }

    public function getBreakableWallPositions(): array {
        return $this->breakableWallPositions;
    }

    public function getDimensions(): array
    {
        return [
            'width' => self::WIDTH,
            'height' => self::HEIGHT
        ];
    }

    public function getBlockSizePx(): int
    {
        return self::BLOCK_SIZE_PX;
    }
}