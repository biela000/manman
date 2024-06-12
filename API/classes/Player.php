<?php

namespace Game;

require_once __DIR__ . '/Map.php';

class Player
{
    private const MOVE_SPEED = 1;

    private string $id;
    private string $ipAddress;
    private array $position;
    private int $lastBombTimestamp;

    public function __construct(string $ipAddress, array $position)
    {
        $this->id = uniqid();
        $this->ipAddress = $ipAddress;
        $this->position = $position;
        $this->lastBombTimestamp = 0;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function moveUp(): void
    {
        $this->position[1] -= self::MOVE_SPEED;
    }

    public function moveDown(): void
    {
        $this->position[1] += self::MOVE_SPEED;
    }

    public function moveLeft(): void
    {
        $this->position[0] -= self::MOVE_SPEED;
    }

    public function moveRight(): void
    {
        $this->position[0] += self::MOVE_SPEED;
    }

    public function placeBomb(Map $map): array
    {
        $this->lastBombTimestamp = time();

        $playerBlockPosition = [
            round($this->position[0] / $map->getDimensions()['width']),
            round($this->position[1] / $map->getDimensions()['height'])
        ];

        return [
            $playerBlockPosition[0] * $map->getBlockSizePx(),
            $playerBlockPosition[1] * $map->getBlockSizePx()
        ];
    }

    public function getPosition(): array
    {
        return $this->position;
    }

    public function canPlaceBomb(): bool
    {
        return time() - $this->lastBombTimestamp > 3000;
    }
}