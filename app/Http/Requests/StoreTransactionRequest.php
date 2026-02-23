<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => [
                'required',
                'in:in,out',
                function ($attribute, $value, $fail) {
                    if ($this->user()?->role === 'petugas_zakat' && $value === 'out') {
                        $fail('Petugas Zakat tidak boleh mencatat pengeluaran.');
                    }
                },
            ],
            'category' => 'required|in:zakat_fitrah,zakat_maal,infaq,infaq_tromol,operasional,gaji,lainnya',
            'amount' => 'required|integer|min:1|max:999999999',
            'payment_method' => 'nullable|in:tunai,transfer,qris',
            'notes' => [
                'nullable',
                'string',
                'max:500',
                // Regex: Allow letters, numbers, spaces, and basic punctuation (.,!?-), block < > ( ) [ ] to prevent XSS
                'regex:/^[a-zA-Z0-9\s.,!?\-]*$/'
            ],
            'donatur_id' => 'nullable|exists:donaturs,id',
            'tromol_box_id' => 'nullable|exists:tromol_boxes,id',
        ];
    }
}
