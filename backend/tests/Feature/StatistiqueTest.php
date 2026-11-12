<?php

namespace Tests\Feature;

use App\Models\Alumni;
use App\Models\Filiere;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatistiqueTest extends TestCase
{
    use RefreshDatabase;

    public function test_coordinator_only_sees_statistics_for_assigned_programs(): void
    {
        $coordinator = User::factory()->create(['role' => 'coordinateur_master']);
        $assigned = Filiere::create(['code' => 'INFO', 'nom' => 'Informatique', 'active' => true]);
        $unassigned = Filiere::create(['code' => 'MATH', 'nom' => 'Mathématiques', 'active' => true]);
        $coordinator->filieres()->attach($assigned);
        Alumni::create(['user_id' => User::factory()->create()->id, 'filiere_id' => $assigned->id]);
        Alumni::create(['user_id' => User::factory()->create()->id, 'filiere_id' => $unassigned->id]);

        $this->actingAs($coordinator, 'sanctum')->getJson('/api/statistiques')
            ->assertOk()
            ->assertJsonPath('alumni', 1)
            ->assertJsonPath('filieres', 1)
            ->assertJsonCount(1, 'par_filiere');
    }

    public function test_alumni_cannot_access_department_statistics(): void
    {
        $alumni = User::factory()->create(['role' => 'alumni']);
        $this->actingAs($alumni, 'sanctum')->getJson('/api/statistiques')->assertForbidden();
    }
}
