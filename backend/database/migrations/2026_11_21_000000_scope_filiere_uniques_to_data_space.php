<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('filieres', function (Blueprint $table) {
            $table->dropUnique('filieres_code_unique');
            $table->dropUnique('filieres_nom_unique');
            $table->unique(['code', 'is_demo'], 'filieres_code_is_demo_unique');
            $table->unique(['nom', 'is_demo'], 'filieres_nom_is_demo_unique');
        });
    }

    public function down(): void
    {
        Schema::table('filieres', function (Blueprint $table) {
            $table->dropUnique('filieres_code_is_demo_unique');
            $table->dropUnique('filieres_nom_is_demo_unique');
            $table->unique('code');
            $table->unique('nom');
        });
    }
};
