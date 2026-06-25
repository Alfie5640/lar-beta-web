<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;

class UserController extends Controller
{
    public function show(Request $request, $id) {
        $currentUser = $request->user();

        $isFriend = $currentUser->friends()->contains('id', $id);

        if (!$isFriend) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id'              => $user->id,
                'username'        => $user->username,
                'bio'             => $user->bio,
                'profile_picture' => $user->profile_picture,
            ]
        ]);
    }
}