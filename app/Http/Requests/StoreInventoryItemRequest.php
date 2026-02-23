<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by Controller Policy
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'item_name' => [
                'required', 
                'string', 
                'max:255',
                'regex:/^[a-zA-Z0-9\s.,!?\-\'"]*$/'
            ],
            'quantity' => ['required', 'integer', 'min:1'],
            'condition' => ['required', 'in:baik,rusak_ringan,rusak_berat'],
            'location' => [
                'nullable', 
                'string', 
                'max:255',
                'regex:/^[a-zA-Z0-9\s.,!?\-\'"]*$/'
            ],
            'notes' => [
                'nullable', 
                'string',
                'regex:/^[a-zA-Z0-9\s.,!?\-\'"]*$/'
            ],
        ];
    }
}
