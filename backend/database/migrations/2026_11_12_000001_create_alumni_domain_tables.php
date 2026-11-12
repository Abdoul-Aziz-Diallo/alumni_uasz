<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nom', 80)->after('id');
            $table->string('prenom', 80)->after('nom');
            $table->string('role', 40)->default('alumni')->index();
            $table->string('statut', 20)->default('actif')->index();
        });

        Schema::create('filieres', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('nom', 120)->unique();
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->unsignedSmallInteger('annee')->index();
            $table->foreignId('filiere_id')->constrained()->restrictOnDelete();
            $table->timestamps();
            $table->unique(['filiere_id', 'annee']);
        });

        Schema::create('diplomes', function (Blueprint $table) {
            $table->id();
            $table->string('intitule', 150);
            $table->unsignedSmallInteger('annee_obtention')->nullable();
            $table->timestamps();
            $table->index(['intitule', 'annee_obtention']);
        });

        Schema::create('entreprises', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 160)->unique();
            $table->string('secteur_activite', 120)->nullable();
            $table->string('adresse', 200)->nullable();
            $table->string('telephone', 40)->nullable();
            $table->string('email', 160)->nullable();
            $table->string('site_web', 200)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('alumni', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('telephone', 30)->nullable();
            $table->string('adresse', 200)->nullable();
            $table->unsignedSmallInteger('annee_entree')->nullable();
            $table->unsignedSmallInteger('annee_sortie')->nullable();
            $table->foreignId('filiere_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('promotion_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('diplome_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
            $table->index(['filiere_id', 'annee_sortie']);
        });

        Schema::create('enseignants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('identifiant_professionnel', 80)->nullable()->unique();
            $table->string('grade_academique', 80)->nullable();
            $table->string('domaine_enseignement', 150)->nullable();
            $table->foreignId('filiere_id')->nullable()->constrained()->nullOnDelete();
            $table->string('coordonnees', 180)->nullable();
            $table->date('date_prise_fonction')->nullable();
            $table->timestamps();
        });

        Schema::create('filiere_user', function (Blueprint $table) {
            $table->foreignId('filiere_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->primary(['filiere_id', 'user_id']);
        });

        Schema::create('stages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumni_id')->constrained('alumni')->cascadeOnDelete();
            $table->foreignId('entreprise_id')->constrained()->restrictOnDelete();
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->string('poste', 150);
            $table->text('description')->nullable();
            $table->timestamps();
            $table->index(['alumni_id', 'date_debut']);
        });

        Schema::create('emplois', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumni_id')->constrained('alumni')->cascadeOnDelete();
            $table->foreignId('entreprise_id')->constrained()->restrictOnDelete();
            $table->string('fonction', 150);
            $table->string('type_contrat', 60)->nullable();
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            $table->index(['alumni_id', 'date_debut']);
        });

        Schema::create('activites', function (Blueprint $table) {
            $table->id();
            $table->string('titre', 180);
            $table->text('description')->nullable();
            $table->string('type', 80)->nullable();
            $table->date('date');
            $table->time('heure')->nullable();
            $table->string('lieu', 180);
            $table->unsignedInteger('capacite')->nullable();
            $table->timestamp('date_limite_inscription')->nullable();
            $table->string('statut', 20)->default('brouillon')->index();
            $table->foreignId('createur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['statut', 'date']);
        });

        Schema::create('participations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumni_id')->constrained('alumni')->cascadeOnDelete();
            $table->foreignId('activite_id')->constrained('activites')->cascadeOnDelete();
            $table->timestamp('date_inscription')->useCurrent();
            $table->boolean('presence')->nullable();
            $table->timestamps();
            $table->unique(['alumni_id', 'activite_id']);
        });

        Schema::create('rapports', function (Blueprint $table) {
            $table->id();
            $table->string('type', 50);
            $table->timestamp('date_generation')->useCurrent();
            $table->json('metadata')->nullable();
            $table->foreignId('genere_par')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rapports');
        Schema::dropIfExists('participations');
        Schema::dropIfExists('activites');
        Schema::dropIfExists('emplois');
        Schema::dropIfExists('stages');
        Schema::dropIfExists('filiere_user');
        Schema::dropIfExists('enseignants');
        Schema::dropIfExists('alumni');
        Schema::dropIfExists('entreprises');
        Schema::dropIfExists('diplomes');
        Schema::dropIfExists('promotions');
        Schema::dropIfExists('filieres');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nom', 'prenom', 'role', 'statut']);
        });
    }
};
