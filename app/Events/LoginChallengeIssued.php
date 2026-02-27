<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LoginChallengeIssued implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $userId,
        public string $challengeToken,
        public string $deviceInfo,
        public int $expiresAt,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     * Broadcast ke private channel milik user yang sedang login (HP A).
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("user.{$this->userId}"),
        ];
    }

    /**
     * Data yang dikirim ke frontend.
     */
    public function broadcastWith(): array
    {
        return [
            'challenge_token' => $this->challengeToken,
            'device_info'     => $this->deviceInfo,
            'expires_at'      => $this->expiresAt,
        ];
    }

    public function broadcastAs(): string
    {
        return 'LoginChallengeIssued';
    }
}
