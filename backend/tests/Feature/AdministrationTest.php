<?php

namespace Tests\Feature;

use App\Models\Filiere;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdministrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_department_head_can_create_an_alumni_account_and_profile(): void
    {
        $admin = User::factory()->create(['role' => 'chef_departement']);
        $filiere = Filiere::create(['code' => 'INFO', 'nom' => 'Informatique', 'active' => true]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/utilisateurs', [
            'nom' => 'Ndiaye', 'prenom' => 'Awa', 'email' => 'awa@example.test',
            'password' => 'SecurePassword!2026', 'role' => 'alumni', 'filiere_id' => $filiere->id,
        ]);

        $response->assertCreated()->assertJsonPath('data.role', 'alumni');
        $this->assertDatabaseHas('users', ['email' => 'awa@example.test', 'name' => 'Awa Ndiaye']);
        $this->assertDatabaseHas('alumni', ['filiere_id' => $filiere->id]);
    }

    public function test_coordinator_cannot_manage_accounts(): void
    {
        $coordinator = User::factory()->create(['role' => 'coordinateur_master']);
        $this->actingAs($coordinator, 'sanctum')->getJson('/api/utilisateurs')->assertForbidden();
    }

    public function test_department_head_can_manage_programs_and_promotions(): void
    {
        $admin = User::factory()->create(['role' => 'chef_departement']);
        $this->actingAs($admin, 'sanctum');

        $filiere = $this->postJson('/api/filieres', ['code' => 'MASTER-INFO', 'nom' => 'Master Informatique', 'active' => true])
            ->assertCreated()->json('id');
        $this->postJson('/api/promotions', ['code' => 'MI-2026', 'annee' => 2026, 'filiere_id' => $filiere])
            ->assertCreated()->assertJsonPath('code', 'MI-2026');
        $this->assertDatabaseHas('promotions', ['code' => 'MI-2026', 'filiere_id' => $filiere]);
    }
}
