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

        $user->password = Hash::make($request->password);
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

        $file = $request->file('profile_picture');

        $imageInfo = @getimagesize($file->getRealPath());
        if (!$imageInfo) {
            return response()->json(['success' => false, 'message' => 'Invalid image file.'], 422);
        }

        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($imageInfo['mime'], $allowedMimes)) {
            return response()->json(['success' => false, 'message' => 'Invalid image type.'], 422);
        }

        $extension = match($imageInfo['mime']) {
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
        };
        $filename = 'profile-pictures/' . bin2hex(random_bytes(16)) . '.' . $extension;

        $user = $request->user();

        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        Storage::disk('public')->put($filename, file_get_contents($file->getRealPath()));

        $user->profile_picture = $filename;
        $user->save();

        return response()->json([
            'success'             => true,
            'profile_picture_url' => Storage::disk('public')->url($filename),
        ]);
    }

    public function deleteAccount(Request $request) {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Incorrect password.',
            ], 403);
        }

        // Delete profile pic
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        // Delete the user
        $user->tokens()->delete();
        $user->delete();

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted.',
        ]);
    }
}