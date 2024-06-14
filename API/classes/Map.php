<?php

namespace Game;

require_once(__DIR__ . '/../classes/constants.php');
require_once(__DIR__ . '/../classes/Balloon.php');

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
    public array $breakableWallPositions = [];
    private array $possibleBreakableWallPositions = [];

    public function __construct()
    {
        $this->generateBreakableWalls();
    }

    private function generateBreakableWalls(): void
    {
        $breakableWallCount = 0;
        $this->possibleBreakableWallPositions = POSSIBLE_BREAKABLE_WALL_POSITIONS;
        while ($breakableWallCount < self::BREAKABLE_WALL_COUNT) {
            $breakableWallPosition = $this->possibleBreakableWallPositions[array_rand($this->possibleBreakableWallPositions)];
            $x = $breakableWallPosition[0];
            $y = $breakableWallPosition[1];

            $this->raw[$y][$x] = Block::BREAKABLE_WALL->value;
            $breakableWallCount++;

            $this->breakableWallPositions[] = $breakableWallPosition;

            $possibleBreakableWallPositions = array_filter($this->possibleBreakableWallPositions, function ($position) use ($x, $y) {
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

    public function isPlayerColliding(array $position): bool {
        $playerBlockPosition = [
            $position[0] / (float)$this->getBlockSizePx(),
            $position[1] / (float)$this->getBlockSizePx()
        ];

        return ($this->raw[ceil($playerBlockPosition[1])][ceil($playerBlockPosition[0])] != Block::EMPTY->value
            || $this->raw[floor($playerBlockPosition[1])][floor($playerBlockPosition[0])] != Block::EMPTY->value
            || $this->raw[ceil($playerBlockPosition[1])][floor($playerBlockPosition[0])] != Block::EMPTY->value
            || $this->raw[floor($playerBlockPosition[1])][ceil($playerBlockPosition[0])] != Block::EMPTY->value);
    }

    public function generateBalloons(): array {
        $balloons = [];

        while (count($balloons) < 15) {
            // Use possible breakable wall positions to spawn balloons
            $balloonPosition = $this->possibleBreakableWallPositions[array_rand($this->possibleBreakableWallPositions)];
            $balloonPosition = [
                $balloonPosition[0] * self::BLOCK_SIZE_PX,
                $balloonPosition[1] * self::BLOCK_SIZE_PX
            ];
            $balloons[] = new Balloon($balloonPosition);

            $this->possibleBreakableWallPositions = array_filter($this->possibleBreakableWallPositions, function ($position) use ($balloonPosition) {
                return $position[0] !== $balloonPosition[0] || $position[1] !== $balloonPosition[1];
            });
        }

        return $balloons;
    }

    public function explodeBomb(array $bombBlockPosition) {
        $bombX = $bombBlockPosition[0];
        $bombY = $bombBlockPosition[1];

        echo "Bomb exploded at: " . $bombX . " " . $bombY . "\n";
        print_r($this->breakableWallPositions);

        $brokenWallPositions = [];

        // Remove breakable walls in the bomb's vicinity from breakableWallPositions
        // Store the removed breakable walls in brokenWallPositions
        // Later remove the breakable walls from the raw map
        foreach ($this->breakableWallPositions as $index => $breakableWallPosition) {
            $breakableWallX = $breakableWallPosition[0];
            $breakableWallY = $breakableWallPosition[1];

            echo 'WJEZDZAM NA PERON';

            if ($breakableWallX == $bombX && abs($breakableWallY - $bombY) <= 2) {
                $brokenWallPositions[] = [$breakableWallX, $breakableWallY];
                unset($this->breakableWallPositions[$index]);
            } elseif ($breakableWallY == $bombY && abs($breakableWallX - $bombX) <= 2) {
                $brokenWallPositions[] = [$breakableWallX, $breakableWallY];
                unset($this->breakableWallPositions[$index]);
            }
        }

        foreach ($brokenWallPositions as $brokenWallPosition) {
            $this->raw[$brokenWallPosition[1]][$brokenWallPosition[0]] = Block::EMPTY->value;
        }

        echo "This shit raaww";
        print_r($this->raw);

        print_r($brokenWallPositions);

        return $brokenWallPositions;
    }
}