<?php

namespace App\Http\Controllers;

use App\Models\Mustahiq;
use App\Imports\MustahiqImport;
use App\Http\Requests\StoreMustahiqRequest;
use App\Http\Requests\UpdateMustahiqRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class MustahiqController extends Controller
{
    use AuthorizesRequests;

    public function index(): Response
    {
        $this->authorize('viewAny', Mustahiq::class);

        $query = Mustahiq::query();

        if (request('search')) {
            $query->where('name', 'like', '%' . request('search') . '%');
        }

        if (request('ashnaf')) {
            $query->where('ashnaf', request('ashnaf'));
        }

        $mustahiqs = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($mustahiq) => [
                'id' => $mustahiq->id,
                'name' => $mustahiq->name,
                'ashnaf' => $mustahiq->ashnaf,
                'address' => $mustahiq->address,
                'description' => $mustahiq->description,
            ]);

        return Inertia::render('Zakat/Mustahiq/Index', [
            'mustahiqs' => $mustahiqs,
            'filters' => request()->only(['search', 'ashnaf']),
        ]);
    }

    public function store(StoreMustahiqRequest $request): RedirectResponse
    {
        $this->authorize('create', Mustahiq::class);

        Mustahiq::create($request->validated());

        return redirect()->back()->with('success', 'Mustahiq berhasil ditambahkan.');
    }

    public function update(UpdateMustahiqRequest $request, Mustahiq $mustahiq): RedirectResponse
    {
        $this->authorize('update', $mustahiq);

        $mustahiq->update($request->validated());

        return redirect()->back()->with('success', 'Data Mustahiq berhasil diperbarui.');
    }

    public function destroy(Mustahiq $mustahiq): RedirectResponse
    {
        $this->authorize('delete', $mustahiq);

        $mustahiq->delete();

        return redirect()->back()->with('success', 'Mustahiq berhasil dihapus.');
    }

    public function import(Request $request): RedirectResponse
    {
        $this->authorize('create', Mustahiq::class);

        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120',
        ]);

        $import = new MustahiqImport();
        $import->import($request->file('file'));

        $failures = $import->failures();
        $importedCount = $import->getImportedCount() - count($failures);

        if (count($failures) > 0) {
            $errorRows = collect($failures)->map(fn ($f) => "Baris {$f->row()}: {$f->errors()[0]}")->take(5)->join(', ');
            return redirect()->back()->with('warning', "Berhasil import {$importedCount} data. {$errorRows}");
        }

        return redirect()->back()->with('success', "Berhasil import {$importedCount} data Mustahiq.");
    }
}
