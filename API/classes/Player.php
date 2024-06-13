<?php

namespace Game;

require_once __DIR__ . '/Map.php';

class Player
{
    private const MOVE_SPEED = 4;

    private string $id;
    private mixed $socketClient;
    private array $position;
    private int $lastBombTimestamp;

    public function __construct(mixed $socketClient, array $position)
    {
        $this->id = uniqid();
        $this->socketClient = $socketClient;
        $this->position = $position;
        $this->lastBombTimestamp = 0;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function moveUp(Map $map): void
    {
        if ($map->isPlayerColliding([$this->position[0], $this->position[1] - self::MOVE_SPEED])) {
            $this->moveToCloserHorizontalBlock($map);
            return;
        }

        $this->position[1] -= self::MOVE_SPEED;
    }

    public function moveToCloserHorizontalBlock(Map $map): void {
        $closerXBlockPosition = round($this->position[0] / (float)$map->getBlockSizePx()) * $map->getBlockSizePx();
        if ($closerXBlockPosition - $this->position[0] < 16 && $closerXBlockPosition > $this->position[0]  && !$map->isPlayerColliding([$this->position[0] + self::MOVE_SPEED, $this->position[1]])) {
            $this->position[0] += self::MOVE_SPEED;
        } elseif ($this->position[0] - $closerXBlockPosition < 16 && $closerXBlockPosition < $this->position[0] && !$map->isPlayerColliding([$this->position[0] - self::MOVE_SPEED, $this->position[1]])) {
            $this->position[0] -= self::MOVE_SPEED;
        }
    }

    public function moveDown(Map $map): void
    {
        if ($map->isPlayerColliding([$this->position[0], $this->position[1] + self::MOVE_SPEED])) {
            $this->moveToCloserHorizontalBlock($map);
            return;
        }

        $this->position[1] += self::MOVE_SPEED;
    }

    public function moveLeft(Map $map): void
    {
        if ($map->isPlayerColliding([$this->position[0] - self::MOVE_SPEED, $this->position[1]])) {
            $this->moveToCloserVerticalBlock($map);
            return;
        }

        $this->position[0] -= self::MOVE_SPEED;
    }

    public function moveToCloserVerticalBlock(Map $map): void {
        $closerYBlockPosition = round($this->position[1] / (float)$map->getBlockSizePx()) * $map->getBlockSizePx();
        if ($closerYBlockPosition - $this->position[1] < 16 && $closerYBlockPosition > $this->position[1] && !$map->isPlayerColliding([$this->position[0], $this->position[1] + self::MOVE_SPEED])) {
            $this->position[1] += self::MOVE_SPEED;
        } elseif ($this->position[1] - $closerYBlockPosition < 16 && $closerYBlockPosition < $this->position[1] && !$map->isPlayerColliding([$this->position[0], $this->position[1] - self::MOVE_SPEED])) {
            $this->position[1] -= self::MOVE_SPEED;
        }
    }

    public function moveRight(Map $map): void
    {
        if ($map->isPlayerColliding([$this->position[0] + self::MOVE_SPEED, $this->position[1]])) {
            $this->moveToCloserVerticalBlock($map);
            return;
        }

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

    public function setPosition(array $position): void
    {
        $this->position = $position;
    }

    public function getIpAddress(): string
    {
        return stream_socket_get_name($this->socketClient, true);
    }

    public function canPlaceBomb(): bool
    {
        return time() - $this->lastBombTimestamp > 3000;
    }

    public function serialize(): array
    {
        return [
            'id' => $this->id,
            'ipAddress' => $this->getIpAddress(),
            'position' => $this->position,
            'lastBombTimestamp' => $this->lastBombTimestamp
        ];
    }
}