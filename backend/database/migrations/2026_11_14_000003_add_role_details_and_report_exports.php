<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coordinateurs_master', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('users')->cascadeOnDelete();
            $table->foreignId('filiere_master_rattachee')->nullable()->constrained('filieres')->nullOnDelete();
            $table->date('date_debut_mandat')->nullable();
            $table->date('date_fin_mandat')->nullable();
            $table->timestamps();
        });

        Schema::create('responsables_filieres', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('users')->cascadeOnDelete();
            $table->text('perimetre_supervision')->nullable();
            $table->date('date_debut_mandat')->nullable();
            $table->date('date_fin_mandat')->nullable();
            $table->timestamps();
        });

        Schema::create('chefs_departements', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('users')->cascadeOnDelete();
            $table->date('date_debut_mandat')->nullable();
            $table->date('date_fin_mandat')->nullable();
            $table->string('niveau_droits_admin', 80)->nullable();
            $table->timestamps();
        });

        $now = now();
        foreach ([
            'coordinateur_master' => 'coordinateurs_master',
            'responsable_filiere' => 'responsables_filieres',
            'chef_departement' => 'chefs_departements',
        ] as $role => $tableName) {
            DB::table($tableName)->insertUsing(
                ['user_id', 'created_at', 'updated_at'],
                DB::table('users')->select('id')->selectRaw('? as created_at, ? as updated_at', [$now, $now])->where('role', $role),
            );
        }

        Schema::create('exportes', function (Blueprint $table) {
            $table->foreignId('responsable_filiere_id')->constrained('responsables_filieres', 'user_id')->cascadeOnDelete();
            $table->foreignId('rapport_id')->constrained('rapports')->cascadeOnDelete();
            $table->timestamp('date_export')->useCurrent();
            $table->primary(['responsable_filiere_id', 'rapport_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exportes');
        Schema::dropIfExists('chefs_departements');
        Schema::dropIfExists('responsables_filieres');
        Schema::dropIfExists('coordinateurs_master');
    }
};
