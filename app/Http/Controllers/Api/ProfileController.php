<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller {

    public function updatePassword(Request $request) {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 403);
        }

        $user->password = $request->password;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password updated.',
        ]);
    }

    public function updateUsername(Request $request) {
        $request->validate([
            'username' => 'required|string|max:255|unique:users,username,' . $request->user()->id,
        ]);

        $user = $request->user();
        $user->username = $request->username;
        $user->save();

        return response()->json([
            'success'  => true,
            'username' => $user->username,
        ]);
    }


    public function updateBio(Request $request) {
        $validated = $request->validate([
            'bio' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $user->bio = $validated['bio'];
        $user->save();

        return response()->json([
            'success' => true,
            'bio'     => $user->bio,
        ]);
    }

    public function uploadProfilePicture(Request $request) {
        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();

        // Delete old picture if one exists
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        $path = $request->file('profile_picture')->store('profile-pictures', 'public');

        $user->profile_picture = $path;
        $user->save();

        return response()->json([
            'success' => true,
            'profile_picture_url' => Storage::disk('public')->url($path),
        ]);
    }
}