<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use App\Models\User;

#[Fillable(['user_id', 'friend_id', 'status'])]
class Friendship extends Model {
    public function sender() {
        return $this->belongsTo(User::class, 'user_id');
    }
}
