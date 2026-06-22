<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClimbingSession;
use App\Models\Friendship;
use Illuminate\Http\Request;

class SessionController extends Controller {
    public function index(Request $request) {
        $friendIds = $request->user()->friends()->pluck('id')->push($request->user()->id);

        $sessions = ClimbingSession::whereIn('user_id', $friendIds)
            ->with([
                'user:id,username,profile_picture',
                'attendees:id,username,profile_picture',
            ])
            ->orderBy('date')
            ->get()
            ->map(function ($session) use ($request) {
                $session->is_attending = $session->attendees
                    ->contains('id', $request->user()->id);
                return $session;
            });

        return response()->json([
            'success'  => true,
            'sessions' => $sessions,
        ]);
    }

    public function join(Request $request, $id) {
        $session = ClimbingSession::findOrFail($id);

        // you cant join your own session
        if ($session->user_id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are the host of this session',
            ], 403);
        }

        $session->attendees()->syncWithoutDetaching([$request->user()->id]);

        return response()->json(['success' => true]);
    }

    public function leave(Request $request, $id) {
        $session = ClimbingSession::findOrFail($id);
        $session->attendees()->detach($request->user()->id);

        return response()->json(['success' => true]);
    }

    public function store(Request $request){
        $validated = $request->validate([
            'place'              => 'required|string|max:255',
            'date'               => 'required|date',
            'time_start'         => 'required|date_format:H:i',
            'time_end'           => 'nullable|date_format:H:i',
            'needs_tr_belayer'   => 'boolean',
            'needs_lead_belayer' => 'boolean',
            'other_need'         => 'nullable|string|max:255',
            'notes'              => 'nullable|string',
        ]);

        $session = $request->user()->climbingSessions()->create($validated);

        return response()->json([
            'success' => true,
            'session' => $session,
        ], 201);
    }
}
