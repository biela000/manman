<?php

namespace Game;

class Balloon
{
    private array $position;
    private array $destination = [];

    public function __construct(array $position)
    {
        $this->position = $position;
    }

    public function move(array $rawMap): string | null {
        if (empty($this->destination) || ($this->position[0] === $this->destination[0] && $this->position[1] === $this->destination[1])) {
            $boxX = $this->position[0] / 32;
            $boxY = $this->position[1] / 32;

            echo "Balloon position: " . $boxX . " " . $boxY . "\n";

            $possibleDestinations = [];
            if ($rawMap[$boxY - 1][$boxX] === Block::EMPTY->value) {
                $possibleDestinations[] = [$boxX * 32, ($boxY - 1) * 32];
            }
            if ($rawMap[$boxY + 1][$boxX] === Block::EMPTY->value) {
                $possibleDestinations[] = [$boxX * 32, ($boxY + 1) * 32];
            }
            if ($rawMap[$boxY][$boxX - 1] === Block::EMPTY->value) {
                $possibleDestinations[] = [($boxX - 1) * 32, $boxY * 32];
            }
            if ($rawMap[$boxY][$boxX + 1] === Block::EMPTY->value) {
                $possibleDestinations[] = [($boxX + 1) * 32, $boxY * 32];
            }

            if (empty($possibleDestinations)) {
                return NULL;
            }

            $this->destination = $possibleDestinations[array_rand($possibleDestinations)];
        }

        if ($this->position[0] < $this->destination[0]) {
            $this->position[0] += 2;
            return 'RIGHT';
        } elseif ($this->position[0] > $this->destination[0]) {
            $this->position[0] -= 2;
            return 'LEFT';
        } elseif ($this->position[1] < $this->destination[1]) {
            $this->position[1] += 2;
            return 'DOWN';
        } elseif ($this->position[1] > $this->destination[1]) {
            $this->position[1] -= 2;
            return 'UP';
        }

        return 'DOWN';
    }

    public function getPosition(): array
    {
        return $this->position;
    }
}