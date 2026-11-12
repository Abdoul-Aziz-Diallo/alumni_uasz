<?php

namespace Tests\Feature;

use App\Models\Alumni;
use App\Models\Filiere;
use App\Models\Rapport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RapportTest extends TestCase
{
    use RefreshDatabase;

    public function test_department_head_can_export_real_data_as_pdf_and_excel(): void
    {
        $head = User::factory()->create(['role' => 'chef_departement']);
        $filiere = Filiere::create(['code' => 'MI', 'nom' => 'Master Informatique']);
        $alumniUser = User::factory()->create();
        Alumni::create(['user_id' => $alumniUser->id, 'filiere_id' => $filiere->id, 'annee_sortie' => 2024]);

        $this->actingAs($head, 'sanctum')->postJson('/api/rapports', ['format' => 'pdf'])->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->postJson('/api/rapports', ['format' => 'xlsx'])->assertOk()->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $this->assertSame(2, Rapport::count());
    }

    public function test_coordinator_cannot_export_a_filiere_outside_their_scope(): void
    {
        $coordinator = User::factory()->create(['role' => 'coordinateur_master']);
        $assigned = Filiere::create(['code' => 'MIA', 'nom' => 'Master A']);
        $outside = Filiere::create(['code' => 'MIB', 'nom' => 'Master B']);
        $coordinator->filieres()->attach($assigned->id);

        $this->actingAs($coordinator, 'sanctum')->postJson('/api/rapports', ['format' => 'pdf', 'filiere_id' => $outside->id])->assertForbidden();
    }
}