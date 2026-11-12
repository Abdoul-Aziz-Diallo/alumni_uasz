<?php

namespace Tests\Feature;

use App\Models\Filiere;
use App\Models\Promotion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferentielTest extends TestCase
{
    use RefreshDatabase;

    public function test_responsable_sees_only_assigned_programs_and_promotions(): void
    {
        $teacher = User::factory()->create(['role' => 'responsable_filiere']);
        $assigned = Filiere::create(['code' => 'INFO', 'nom' => 'Informatique', 'active' => true]);
        $other = Filiere::create(['code' => 'MATH', 'nom' => 'Mathématiques', 'active' => true]);
        $teacher->filieres()->attach($assigned);
        Promotion::create(['code' => 'INFO-2025', 'annee' => 2025, 'filiere_id' => $assigned->id]);
        Promotion::create(['code' => 'MATH-2025', 'annee' => 2025, 'filiere_id' => $other->id]);

        $this->actingAs($teacher, 'sanctum')->getJson('/api/filieres')->assertOk()->assertJsonCount(1);
        $this->getJson('/api/promotions')->assertOk()->assertJsonCount(1);
    }
}
