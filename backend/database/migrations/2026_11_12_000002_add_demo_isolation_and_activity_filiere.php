<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $demoTables = [
        'users', 'filieres', 'promotions', 'diplomes', 'alumni', 'enseignants',
        'entreprises', 'stages', 'emplois', 'activites', 'participations', 'rapports',
    ];

    public function up(): void
    {
        foreach ($this->demoTables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->boolean('is_demo')->default(false)->index();
            });
        }

        Schema::table('activites', function (Blueprint $table) {
            $table->foreignId('filiere_id')->nullable()->after('createur_id')->constrained()->nullOnDelete();
        });

        DB::table('users')->where('email', 'like', '%@alumni.local')->update(['is_demo' => true]);
        DB::table('users')->where('email', 'enseignant@alumni.local')->update(['statut' => 'desactive']);
        DB::table('filieres')->whereIn('code', ['LIC-INFO', 'MST-INFO'])->update(['is_demo' => true]);
        DB::table('promotions')->whereIn('code', ['LIC-INFO-2022', 'MST-INFO-2024'])->update(['is_demo' => true]);
        DB::table('diplomes')->whereIn('intitule', ['Licence en Informatique', 'Master en Informatique'])->update(['is_demo' => true]);

        $demoUserIds = DB::table('users')->where('is_demo', true)->pluck('id');
        $demoAlumniIds = DB::table('alumni')->whereIn('user_id', $demoUserIds)->pluck('id');
        DB::table('alumni')->whereIn('id', $demoAlumniIds)->update(['is_demo' => true]);
        DB::table('enseignants')->whereIn('user_id', $demoUserIds)->update(['is_demo' => true]);
        DB::table('stages')->whereIn('alumni_id', $demoAlumniIds)->update(['is_demo' => true]);
        DB::table('emplois')->whereIn('alumni_id', $demoAlumniIds)->update(['is_demo' => true]);
        DB::table('participations')->whereIn('alumni_id', $demoAlumniIds)->update(['is_demo' => true]);
        DB::table('entreprises')->whereIn('id', DB::table('stages')->whereIn('alumni_id', $demoAlumniIds)->select('entreprise_id'))
            ->orWhereIn('id', DB::table('emplois')->whereIn('alumni_id', $demoAlumniIds)->select('entreprise_id'))
            ->update(['is_demo' => true]);

        $demoActivityIds = DB::table('activites')->where('titre', 'Rencontre des alumni UASZ (démo)')->pluck('id');
        DB::table('activites')->whereIn('id', $demoActivityIds)->update(['is_demo' => true]);
        DB::table('participations')->whereIn('activite_id', $demoActivityIds)->update(['is_demo' => true]);
    }

    public function down(): void
    {
        Schema::table('activites', function (Blueprint $table) {
            $table->dropConstrainedForeignId('filiere_id');
        });
        foreach (array_reverse($this->demoTables) as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropIndex(['is_demo']);
                $table->dropColumn('is_demo');
            });
        }
    }
};
