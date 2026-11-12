<?php

namespace Tests\Feature;

use App\Models\Alumni;
use App\Models\Entreprise;
use App\Models\Stage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExperienceTest extends TestCase
{
    use RefreshDatabase;

    public function test_alumni_can_create_a_stage_for_their_own_profile(): void
    {
        $user = User::factory()->create();
        $alumni = Alumni::create(['user_id' => $user->id]);
        $company = Entreprise::create(['nom' => 'Entreprise Démo']);

        $this->actingAs($user, 'sanctum')->postJson('/api/stages', [
            'entreprise_id' => $company->id,
            'date_debut' => '2024-01-10',
            'poste' => 'Développeur stagiaire',
        ])->assertCreated()->assertJsonPath('alumni_id', $alumni->id);
    }

    public function test_alumni_cannot_change_another_alumnus_stage(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $otherAlumni = Alumni::create(['user_id' => $other->id]);
        $company = Entreprise::create(['nom' => 'Société Démo']);
        $stage = Stage::create([
            'alumni_id' => $otherAlumni->id,
            'entreprise_id' => $company->id,
            'date_debut' => '2024-01-10',
            'poste' => 'Stage',
        ]);

        $this->actingAs($owner, 'sanctum')->putJson('/api/stages/'.$stage->id, ['poste' => 'Intrusion'])->assertForbidden();
        $this->assertSame('Stage', $stage->fresh()->poste);
    }
}