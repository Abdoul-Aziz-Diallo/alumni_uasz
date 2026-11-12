<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new \RuntimeException('Demo data seeding is only allowed in local or testing environments.');
        }

        $this->call(DemoSeeder::class);
    }
}
