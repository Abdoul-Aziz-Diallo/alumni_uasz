<?php

namespace Tests\Feature;

use App\Models\Filiere;
use App\Models\Promotion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    private function references(): array
    {
        $filiere = Filiere::create(['code' => 'INFO', 'nom' => 'Informatique', 'active' => true, 'is_demo' => false]);
        $promotion = Promotion::create(['code' => 'INFO-2025', 'annee' => 2025, 'filiere_id' => $filiere->id, 'is_demo' => false]);
        return [$filiere, $promotion];
    }

    public function test_public_registration_creates_only_an_alumni_account_with_a_hashed_password(): void
    {
        [$filiere, $promotion] = $this->references();
        $response = $this->postJson('/api/auth/register', [
            'prenom' => 'Mariama', 'nom' => 'Sarr', 'email' => 'mariama@example.test',
            'password' => 'LongSecure!2026', 'password_confirmation' => 'LongSecure!2026',
            'telephone' => '+221770000000', 'filiere_id' => $filiere->id, 'promotion_id' => $promotion->id,
        ]);

        $response->assertCreated()->assertJsonPath('data.role', 'alumni')->assertJsonPath('data.is_demo', false);
        $user = User::where('email', 'mariama@example.test')->firstOrFail();
        $this->assertTrue(Hash::check('LongSecure!2026', $user->password));
        $this->assertFalse($user->is_demo);
        $this->assertDatabaseHas('alumni', ['user_id' => $user->id, 'filiere_id' => $filiere->id, 'promotion_id' => $promotion->id]);
    }

    public function test_public_registration_cannot_assign_an_institutional_role(): void
    {
        [$filiere] = $this->references();
        $this->postJson('/api/auth/register', [
            'prenom' => 'Test', 'nom' => 'User', 'email' => 'role@example.test',
            'password' => 'LongSecure!2026', 'password_confirmation' => 'LongSecure!2026',
            'filiere_id' => $filiere->id, 'role' => 'chef_departement',
        ])->assertUnprocessable();
        $this->assertDatabaseMissing('users', ['email' => 'role@example.test']);
    }

    public function test_public_registration_rejects_a_demo_program(): void
    {
        $filiere = Filiere::create(['code' => 'DEMO', 'nom' => 'Informatique démo', 'active' => true, 'is_demo' => true]);
        $this->postJson('/api/auth/register', [
            'prenom' => 'Test', 'nom' => 'User', 'email' => 'demo-program@example.test',
            'password' => 'LongSecure!2026', 'password_confirmation' => 'LongSecure!2026',
            'filiere_id' => $filiere->id,
        ])->assertUnprocessable();
    }

    public function test_new_alumni_can_login_and_read_their_session_profile(): void
    {
        [$filiere] = $this->references();
        $this->postJson('/api/auth/register', [
            'prenom' => 'Seynabou', 'nom' => 'Gueye', 'email' => 'seynabou@example.test',
            'password' => 'LongSecure!2026', 'password_confirmation' => 'LongSecure!2026', 'filiere_id' => $filiere->id,
        ])->assertCreated();

        $this->withHeader('Origin', 'http://127.0.0.1:5173')->postJson('/api/auth/login', ['email' => 'seynabou@example.test', 'password' => 'LongSecure!2026'])
            ->assertOk()->assertJsonPath('data.role', 'alumni');
        $this->withHeader('Origin', 'http://127.0.0.1:5173')->getJson('/api/auth/me')->assertOk()->assertJsonPath('data.email', 'seynabou@example.test');
    }
}
