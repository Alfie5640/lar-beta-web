<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Friendship;
use Illuminate\Http\Request;
use App\Models\User;

class FriendshipController extends Controller {

    public function sendRequest(Request $request) {
        $request->validate([
            'friend_id' => 'required|integer|exists:users,id|different:' . $request->user()->id,
        ]);

        $existing = Friendship::where(function ($query) use ($request) {
            $query->where('user_id', $request->user()->id)
                ->where('friend_id', $request->friend_id);
        })->orWhere(function ($query) use ($request) {
            $query->where('user_id', $request->friend_id)
                ->where('friend_id', $request->user()->id);
        })->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'A friendship or request already exists between these users.',
            ], 409);
        }

        $friendship = Friendship::create([
            'user_id'   => $request->user()->id,
            'friend_id' => $request->friend_id,
            'status'    => 'pending',
        ]);

        return response()->json([
            'success'    => true,
            'friendship' => $friendship,
        ], 201);
    }

    public function respondRequest(Request $request) {
        $request->validate([
            'friendship_id' => 'required|integer|exists:friendships,id',
            'status'        => 'required|in:accepted,rejected',
        ]);

        $friendship = Friendship::find($request->friendship_id);

        // Only the recipient of the request can respond to it
        if ($friendship->friend_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to respond to this request.',
            ], 403);
        }

        $friendship->status = $request->status;
        $friendship->save();

        return response()->json([
            'success'    => true,
            'friendship' => $friendship,
        ]);
    }

    public function pendingRequests(Request $request) {
        $requests = Friendship::where('friend_id', $request->user()->id)
            ->where('status', 'pending')
            ->with('sender')
            ->get();

        return response()->json([
            'success'  => true,
            'requests' => $requests,
        ]);
    }

    public function retrieveFriends(Request $request) {
        $userId = $request->user()->id;

        $friendships = Friendship::where('status', 'accepted')
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhere('friend_id', $userId);
            })
            ->get();

        return response()->json([
            'success' => true,
            'friends' => $friendships,
        ]);
    }

    public function searchValidUsers(Request $request) {
        $request->validate([
            'username' => 'required|string|min:1',
        ]);

        $users = User::where('username', 'like', '%' . $request->username . '%')
            ->where('id', '!=', $request->user()->id)
            ->limit(10)
            ->get(['id', 'username']);

        return response()->json([
            'success' => true,
            'users'   => $users,
        ]);
    }

    public function removeFriend(Request $request, $id) {
        $userId = $request->user()->id;

        $friendship = Friendship::where('id', $id)
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhere('friend_id', $userId);
            })
            ->first();

        if (!$friendship) {
            return response()->json([
                'success' => false,
                'message' => 'Friendship not found.',
            ], 404);
        }

        $friendship->delete();

        return response()->json([
            'success' => true,
            'message' => 'Friend removed.',
        ]);
    }
}
