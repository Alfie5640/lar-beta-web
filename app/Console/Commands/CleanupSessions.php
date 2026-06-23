<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\ClimbingSession;

class CleanupSessions extends Command
{
    protected $signature = 'sessions:cleanup';
    protected $description = 'Delete old climbing sessions';

    public function handle() {
        ClimbingSession::whereDate('date', '<', now()->subDays(30))
            ->delete();

        return self::SUCCESS;
}
}
