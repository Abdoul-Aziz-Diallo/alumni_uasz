<?php

namespace Tests\Feature;

use App\Models\Alumni;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_user_can_login_and_read_current_identity(): void
    {
        $user = User::factory()->create(['email' => 'alumni@example.test', 'role' => 'alumni']);

        $this->withHeader('Origin', 'http://127.0.0.1:5173')
            ->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'Password!2026'])
            ->assertOk()
            ->assertJsonPath('data.role', 'alumni')
            ->assertJsonPath('data.id', $user->id);

        $this->withHeader('Origin', 'http://127.0.0.1:5173')
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_inactive_user_cannot_login(): void
    {
        $user = User::factory()->create(['statut' => 'desactive']);

        $this->withHeader('Origin', 'http://127.0.0.1:5173')
            ->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'Password!2026'])
            ->assertUnprocessable();
    }

    public function test_roles_outside_the_four_functional_profiles_cannot_login(): void
    {
        $legacyAccount = User::factory()->create(['role' => 'enseignant', 'statut' => 'actif']);

        $this->withHeader('Origin', 'http://127.0.0.1:5173')
            ->postJson('/api/auth/login', ['email' => $legacyAccount->email, 'password' => 'Password!2026'])
            ->assertUnprocessable();
    }

    public function test_alumni_cannot_read_another_alumnus_profile(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $profile = Alumni::create(['user_id' => $other->id]);

        $this->actingAs($owner, 'sanctum')
            ->getJson('/api/alumni/'.$profile->id)
            ->assertForbidden();
    }
}
