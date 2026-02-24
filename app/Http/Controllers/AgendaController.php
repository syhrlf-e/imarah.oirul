<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAgendaRequest;
use App\Http\Requests\UpdateAgendaRequest;
use App\Models\Agenda;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AgendaController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Agenda::class);

        $agendas = Agenda::with('creator:id,name')
            ->orderBy('start_time', 'desc')
            ->paginate(10);

        return Inertia::render('Agenda/Index', [
            'agendas' => $agendas,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAgendaRequest $request): RedirectResponse
    {
        $this->authorize('create', Agenda::class);

        DB::transaction(function () use ($request) {
            $agenda = Agenda::create([
                ...$request->validated(),
                'created_by' => auth()->id(),
            ]);
        });

        return redirect()->back()->with('success', 'Agenda berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAgendaRequest $request, Agenda $agenda): RedirectResponse
    {
        $this->authorize('update', $agenda);

        DB::transaction(function () use ($request, $agenda) {
            $agenda->update($request->validated());
        });

        return redirect()->back()->with('success', 'Agenda berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Agenda $agenda): RedirectResponse
    {
        $this->authorize('delete', $agenda);

        DB::transaction(function () use ($agenda) {
            $agenda->delete();
        });

        return redirect()->back()->with('success', 'Agenda berhasil dihapus.');
    }
}
