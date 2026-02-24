<?php

namespace Tests\Feature\Zakat;

use App\Models\Donatur;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class MuzakkiTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_render_muzakki_index_page()
    {
        $user = User::factory()->create(['role' => 'bendahara']);

        Donatur::factory()->count(10)->create();

        $response = $this->actingAs($user)->get(route('zakat.muzakki'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Zakat/Muzakki/Index')
            ->has('muzakkis.data', 10)
        );
    }

    /** @test */
    public function it_can_create_new_muzakki()
    {
        $user = User::factory()->create(['role' => 'bendahara']);

        $response = $this->actingAs($user)->post(route('zakat.muzakki.store'), [
            'name' => 'John Doe',
            'phone' => '08123456789',
            'address' => 'Jl. Sudirman No. 1',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('donaturs', [
            'name' => 'John Doe',
            'phone' => '08123456789',
        ]);
    }

    /** @test */
    public function it_validates_create_muzakki_request()
    {
        $user = User::factory()->create(['role' => 'bendahara']);

        $response = $this->actingAs($user)->post(route('zakat.muzakki.store'), [
            'name' => '', // Required
        ]);

        $response->assertSessionHasErrors(['name']);
    }

    /** @test */
    public function it_can_update_muzakki()
    {
        $user = User::factory()->create(['role' => 'bendahara']);
        $muzakki = Donatur::factory()->create();

        $response = $this->actingAs($user)->put(route('zakat.muzakki.update', $muzakki->id), [
            'name' => 'Updated Name',
            'phone' => '08987654321',
            'address' => 'New Address',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('donaturs', [
            'id' => $muzakki->id,
            'name' => 'Updated Name',
        ]);
    }

    /** @test */
    public function it_can_soft_delete_muzakki()
    {
        $user = User::factory()->create(['role' => 'super_admin']);
        $muzakki = Donatur::factory()->create();

        $response = $this->actingAs($user)->delete(route('zakat.muzakki.destroy', $muzakki->id));

        $response->assertRedirect();
        $this->assertSoftDeleted('donaturs', [
            'id' => $muzakki->id,
        ]);
    }

    /** @test */
    public function it_can_search_muzakki()
    {
        $user = User::factory()->create(['role' => 'bendahara']);
        Donatur::factory()->create(['name' => 'Specific Name']);
        Donatur::factory()->create(['name' => 'Another Name']);

        $response = $this->actingAs($user)->get(route('zakat.muzakki', ['search' => 'Specific']));

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Zakat/Muzakki/Index')
            ->has('muzakkis.data', 1)
            ->where('muzakkis.data.0.name', 'Specific Name')
        );
    }
}
