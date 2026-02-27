<?php

namespace App\Imports;

use App\Models\Donatur;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\Importable;

class MuzakkiImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use Importable, SkipsFailures;

    private int $imported = 0;

    private function sanitizeInput(?string $value): ?string
    {
        if (empty($value)) {
            return $value;
        }

        // Prevent CSV/Excel Formula Injection
        $firstChar = substr($value, 0, 1);
        if (in_array($firstChar, ['=', '+', '-', '@'])) {
            $value = "'" . $value;
        }

        return $value;
    }

    public function model(array $row)
    {
        $this->imported++;

        return new Donatur([
            'name'    => $this->sanitizeInput($row['nama']),
            'phone'   => $this->sanitizeInput($row['no_hp'] ?? $row['telepon'] ?? $row['phone'] ?? null),
            'address' => $this->sanitizeInput($row['alamat'] ?? $row['address'] ?? null),
        ]);
    }

    public function rules(): array
    {
        return [
            'nama' => 'required|string|max:255',
        ];
    }

    public function getImportedCount(): int
    {
        return $this->imported;
    }
}
