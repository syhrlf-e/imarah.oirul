<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambahkan index pada kolom yang sering digunakan di WHERE, GROUP BY, dan ORDER BY.
     * Index ini mempercepat query di Dashboard, Kas, Laporan, dan Zakat.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('type');
            $table->index('category');
            $table->index('created_at');
            $table->index('deleted_at');
            // Composite index untuk query summary yang selalu filter type + category bersamaan
            $table->index(['type', 'category']);
            // Composite index untuk query yang filter type + category + range created_at
            $table->index(['type', 'category', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['type']);
            $table->dropIndex(['category']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['deleted_at']);
            $table->dropIndex(['type', 'category']);
            $table->dropIndex(['type', 'category', 'created_at']);
        });
    }
};
