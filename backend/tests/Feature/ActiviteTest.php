<?php

namespace Tests\Feature;

use App\Models\Activite;
use App\Models\Alumni;
use App\Models\Filiere;
use App\Models\Participation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActiviteTest extends TestCase
{
    use RefreshDatabase;

    public function test_alumni_can_register_once_until_activity_capacity_is_reached(): void
    {
        $user = User::factory()->create();
        Alumni::create(['user_id' => $user->id]);
        $activity = Activite::create([
            'titre' => 'Rencontre alumni',
            'date' => today()->addWeek(),
            'lieu' => 'UASZ',
            'statut' => 'publiee',
            'capacite' => 1,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/activites/'.$activity->id.'/inscriptions')
            ->assertCreated();
        $this->postJson('/api/activites/'.$activity->id.'/inscriptions')->assertStatus(409);
        $this->assertSame(1, Participation::where('activite_id', $activity->id)->count());
    }

    public function test_non_alumni_cannot_register_for_an_activity(): void
    {
        $user = User::factory()->create(['role' => 'coordinateur_master']);
        $activity = Activite::create(['titre' => 'Rencontre', 'date' => today()->addWeek(), 'lieu' => 'UASZ', 'statut' => 'publiee']);

        $this->actingAs($user, 'sanctum')->postJson('/api/activites/'.$activity->id.'/inscriptions')->assertForbidden();
    }

    public function test_alumni_cannot_delete_a_department_activity(): void
    {
        $user = User::factory()->create(['role' => 'alumni']);
        $activity = Activite::create(['titre' => 'Rencontre', 'date' => today()->addWeek(), 'lieu' => 'UASZ', 'statut' => 'publiee']);

        $this->actingAs($user, 'sanctum')->deleteJson('/api/activites/'.$activity->id)->assertForbidden();
        $this->assertDatabaseHas('activites', ['id' => $activity->id]);
    }

    public function test_program_coordinator_can_create_update_and_delete_an_activity_in_scope(): void
    {
        $coordinator = User::factory()->create(['role' => 'coordinateur_master']);
        $filiere = Filiere::create(['code' => 'MASTER', 'nom' => 'Master Informatique', 'active' => true]);
        $coordinator->filieres()->attach($filiere);
        $this->actingAs($coordinator, 'sanctum');
        $payload = ['titre' => 'Conférence Alumni', 'date' => today()->addMonth()->toDateString(), 'lieu' => 'UASZ', 'filiere_id' => $filiere->id];

        $activityId = $this->postJson('/api/activites', $payload)->assertCreated()->json('id');
        $this->assertDatabaseHas('activites', ['id' => $activityId, 'is_demo' => false, 'filiere_id' => $filiere->id]);
        $this->putJson('/api/activites/'.$activityId, [...$payload, 'titre' => 'Conférence Alumni mise à jour'])->assertOk();
        $this->assertDatabaseHas('activites', ['id' => $activityId, 'titre' => 'Conférence Alumni mise à jour']);
        $this->deleteJson('/api/activites/'.$activityId)->assertNoContent();
        $this->assertDatabaseMissing('activites', ['id' => $activityId]);
    }

    public function test_coordinator_cannot_manage_an_activity_outside_their_filiere(): void
    {
        $coordinator = User::factory()->create(['role' => 'coordinateur_master']);
        $assigned = Filiere::create(['code' => 'MASTER', 'nom' => 'Master Informatique', 'active' => true]);
        $outside = Filiere::create(['code' => 'LICENCE', 'nom' => 'Licence Informatique', 'active' => true]);
        $coordinator->filieres()->attach($assigned);
        $activity = Activite::create(['titre' => 'Activité hors périmètre', 'date' => today()->addMonth(), 'lieu' => 'UASZ', 'statut' => 'publiee', 'filiere_id' => $outside->id]);

        $this->actingAs($coordinator, 'sanctum')
            ->putJson('/api/activites/'.$activity->id, ['titre' => 'Modification interdite', 'date' => today()->addMonth()->toDateString(), 'lieu' => 'UASZ', 'filiere_id' => $outside->id])
            ->assertForbidden();
        $this->deleteJson('/api/activites/'.$activity->id)->assertForbidden();
        $this->assertDatabaseHas('activites', ['id' => $activity->id, 'titre' => 'Activité hors périmètre']);
    }
}
