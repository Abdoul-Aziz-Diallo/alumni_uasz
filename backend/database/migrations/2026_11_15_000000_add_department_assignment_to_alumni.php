<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->foreignId('chef_departement_id')->nullable()->after('user_id')
                ->constrained('chefs_departements', 'user_id')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->dropConstrainedForeignId('chef_departement_id');
        });
    }
};
