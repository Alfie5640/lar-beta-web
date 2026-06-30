<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\FriendshipController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Models\User;
use Illuminate\Http\Request;

Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
    $user = User::findOrFail($id);

    if (!hash_equals((string) $hash, sha1($user->email))) {
        return response()->json(['success' => false, 'message' => 'Invalid verification link.'], 403);
    }

    if ($user->hasVerifiedEmail()) {
        return redirect(config('app.url') . '/pages/login.html?verified=already');
    }

    $user->markEmailAsVerified();
    return redirect(config('app.url') . '/pages/login.html?verified=1');

})->middleware('signed')->name('verification.verify');

Route::post('/email/resend', function (Request $request) {
    $request->validate(['email' => 'required|email']);

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['success' => false, 'message' => 'User not found.'], 404);
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json(['success' => false, 'message' => 'Email already verified.']);
    }

    $user->sendEmailVerificationNotification();
    return response()->json(['success' => true, 'message' => 'Verification email resent.']);
})->middleware('throttle:3,1');

Route::post('/email/resend-by-username', function (Request $request) {
    $request->validate(['username' => 'required|string']);

    $user = User::where('username', $request->username)->first();

    if (!$user) {
        return response()->json(['success' => false, 'message' => 'User not found.'], 404);
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json(['success' => false, 'message' => 'Email already verified.']);
    }

    $user->sendEmailVerificationNotification();
    return response()->json(['success' => true, 'message' => 'Verification email sent — check your inbox.']);
})->middleware('throttle:3,1');

Route::middleware('throttle:3,1')->group(function () {
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
});

Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// no verified check 
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});

// all protected features
Route::middleware(['auth:sanctum', \App\Http\Middleware\EnsureEmailIsVerified::class])->group(function () {
    Route::middleware('throttle:10,1')->group(function () {
        Route::patch('/profile/username', [ProfileController::class, 'updateUsername']);
        Route::patch('/profile/password', [ProfileController::class, 'updatePassword']);
        Route::delete('/profile', [ProfileController::class, 'deleteAccount']);
    });
    Route::post('/sessions', [SessionController::class, 'store']);
    Route::get('/sessions', [SessionController::class, 'index']);
    Route::get('/friends', [FriendshipController::class, 'retrieveFriends']);
    Route::post('/friends/request', [FriendshipController::class, 'sendRequest']);
    Route::post('/friends/respond', [FriendshipController::class, 'respondRequest']);
    Route::get('/friends/pending', [FriendshipController::class, 'pendingRequests']);
    Route::get('/friends/search', [FriendshipController::class, 'searchValidUsers']);
    Route::delete('/friends/{id}', [FriendshipController::class, 'removeFriend']);
    Route::post('/profile/bio', [ProfileController::class, 'updateBio']);
    Route::post('/profile/picture', [ProfileController::class, 'uploadProfilePicture']);
    Route::post('/sessions/{id}/join', [SessionController::class, 'join']);
    Route::delete('/sessions/{id}/leave', [SessionController::class, 'leave']);
    Route::get('/users/{id}', [UserController::class, 'show']);
});