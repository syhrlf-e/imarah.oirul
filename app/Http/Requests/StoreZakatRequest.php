<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreZakatRequest extends FormRequest
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
            'type' => 'required|in:maal,fitrah',
            'amount' => 'required_if:type,maal|numeric|min:1|max:999999999',
            'jiwa' => 'required_if:type,fitrah|integer|min:1',
            'nominal_per_jiwa' => 'required_if:type,fitrah|integer|min:1',
            'donatur_id' => 'required|exists:donaturs,id',
            'payment_method' => 'required|in:tunai,transfer,qris',
            'notes' => 'nullable|string',
        ];
    }
}
