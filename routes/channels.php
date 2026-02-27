<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private channel untuk Login Challenge — HP A mendengarkan event dari channel ini
Broadcast::channel('user.{id}', function ($user, $id) {
    return $user->id === $id;
});
