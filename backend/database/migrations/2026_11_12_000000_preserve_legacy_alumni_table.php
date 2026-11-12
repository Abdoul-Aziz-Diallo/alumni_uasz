<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('alumni')
            || ! Schema::hasColumn('alumni', 'utilisateur_id')
            || Schema::hasColumn('alumni', 'user_id')) {
            return;
        }

        if (DB::table('alumni')->count() !== 0) {
            throw new RuntimeException(
                'La table historique alumni contient des données; migration arrêtée sans modification. '
                .'Un plan de conversion avec conservation des enregistrements est nécessaire.'
            );
        }

        if (Schema::hasTable('alumni_legacy')) {
            throw new RuntimeException('La table alumni_legacy existe déjà; migration arrêtée sans modification.');
        }

        Schema::rename('alumni', 'alumni_legacy');
    }

    public function down(): void
    {
        if (Schema::hasTable('alumni_legacy') && ! Schema::hasTable('alumni')) {
            Schema::rename('alumni_legacy', 'alumni');
        }
    }
};
