<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    /** @use HasFactory<\Database\Factories\TransactionFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'type',
        'category',
        'amount',
        'payment_method',
        'notes',
        'donatur_id',
        'tromol_box_id',
        'mustahiq_id',
        'transaction_date',
        'created_by',
        'verified_at',
        'verified_by',
    ];

    protected $casts = [
        'amount' => 'integer',
        'verified_at' => 'datetime',
    ];

    public function donatur()
    {
        return $this->belongsTo(Donatur::class);
    }

    public function mustahiq()
    {
        return $this->belongsTo(Mustahiq::class);
    }

    public function tromolBox()
    {
        return $this->belongsTo(TromolBox::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
