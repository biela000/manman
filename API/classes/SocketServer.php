<?php

namespace Game;

class SocketServer {
    private const HOST = '127.0.0.1';
    private const PORT = 46089;
    private const TRANSPORT = 'http';
    private $server;
    private array $clients;
    private bool $running = false;

    public function __construct() {
        $this->server = stream_socket_server("tcp://" . self::HOST . ":" . self::PORT, $errorNumber, $errorMessage);
        if (!$this->server) {
            die("$errorMessage ($errorNumber)");
        }

        $this->clients = array($this->server);
    }

    public function start(): void {
        $this->running = true;
        while ($this->running) {
            echo "Server is running\n";
            $writeStreams = NULL;
            $exceptStreams = NULL;
            $changedStreams = $this->clients;
            stream_select($changedStreams, $writeStreams, $exceptStreams, 4); // 4s - TICKI!!!!!

            if (in_array($this->server, $changedStreams)) {
                $client = @stream_socket_accept($this->server);
                if (!$client) {
                    // Possibly needs changing
                    continue;
                }
                $this->clients[] = $client;
                $ip = stream_socket_get_name($client, true);
                echo "New Client connected from $ip\n";

                stream_set_blocking($client, true);
                $headers = fread($client, 1500);
                $this->handshake($client, $headers);
                stream_set_blocking($client, false);

                $data = ["msg" => "Client connected"];

                $this->sendMessage($this->clients, $this->mask(json_encode($data))); //połączenie -> aktualne dane

                $found_socket = array_search($this->server, $changedStreams);
                unset($changedStreams[$found_socket]);
            }

            foreach ($changedStreams as $changed_socket) {   // wiadomość od klienta
                // Replace this code with a handling function passed in the constructor later
                print_r($changed_socket);

                $ip = stream_socket_get_name($changed_socket, true);
                $buffer = stream_get_contents($changed_socket);

                if (!$buffer) {
                    echo "Client Disconnected from $ip\n";
                    @fclose($changed_socket);
                    $found_socket = array_search($changed_socket, $this->clients);
                    unset($this->clients[$found_socket]);
                }

                $unmasked = $this->unmask($buffer);
                if ($unmasked != "") {
                    echo "\nReceived a Message from $ip:\n\"$unmasked\" \n";
                }

                $response = $this->mask($unmasked);
                $this->sendMessage($this->clients, $response);
            }

            $this->sendMessage($this->clients, $this->mask(json_encode(["msg" => "tick"])));
        }
    }

    public function stop(): bool {
        $this->running = false;
        return fclose($this->server);
    }

    private function unmask($text): string
    {
        $length = @ord($text[1]) & 127;
        if ($length == 126) {
            $masks = substr($text, 4, 4);
            $data = substr($text, 8);
        } elseif ($length == 127) {
            $masks = substr($text, 10, 4);
            $data = substr($text, 14);
        } else {
            $masks = substr($text, 2, 4);
            $data = substr($text, 6);
        }
        $text = "";
        for ($i = 0; $i < strlen($data); ++$i) {
            $text .= $data[$i] ^ $masks[$i % 4];
        }
        return $text;
    }

    private function mask($text): string
    {
        $b1 = 0x80 | (0x1 & 0x0f);
        $length = strlen($text);
        if ($length <= 125)
            $header = pack('CC', $b1, $length);
        elseif ($length < 65536)
            $header = pack('CCn', $b1, 126, $length);
        else
            $header = pack('CCNN', $b1, 127, $length);
        return $header . $text;
    }

    private function handshake($client, $receivedMessage): void
    {
        $headers = array();
        $lines = preg_split("/\r\n/", $receivedMessage);
        foreach ($lines as $line) {
            $line = rtrim($line);
            if (preg_match('/\A(\S+): (.*)\z/', $line, $matches)) {
                $headers[$matches[1]] = $matches[2];
            }
        }
        $secKey = $headers['Sec-WebSocket-Key'];
        $secAccept = base64_encode(pack('H*', sha1($secKey . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
        //hand shaking header
        $upgrade = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" .
            "Upgrade: websocket\r\n" .
            "Connection: Upgrade\r\n" .
            "WebSocket-Origin: " . (self::HOST) . "\r\n" .
            "WebSocket-Location: ssl://" . (self::HOST) . ":" . (self::PORT) . "\r\n" .
            "Sec-WebSocket-Version: 13\r\n" .
            "Sec-WebSocket-Accept:$secAccept\r\n\r\n";
        fwrite($client, $upgrade);
    }

    public function sendMessage($clients, $msg): void
    {
        foreach ($clients as $changed_socket) {
            @fwrite($changed_socket, $msg);
        }
    }
}