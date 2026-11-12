<?php

use App\Http\Controllers\Api\ActiviteController;
use App\Http\Controllers\Api\AlumniController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmploiController;
use App\Http\Controllers\Api\EntrepriseController;
use App\Http\Controllers\Api\FiliereController;
use App\Http\Controllers\Api\ParticipationController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\PublicStatsController;
use App\Http\Controllers\Api\PublicReferenceController;
use App\Http\Controllers\Api\RapportController;
use App\Http\Controllers\Api\StatistiqueController;
use App\Http\Controllers\Api\StageController;
use App\Http\Controllers\Api\UtilisateurController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::get('/public/statistiques', PublicStatsController::class);
Route::get('/public/referentiels', PublicReferenceController::class);
Route::get('/activites', [ActiviteController::class, 'index']);
Route::get('/activites/{activite}', [ActiviteController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/filieres', [FiliereController::class, 'index']);
    Route::get('/promotions', [PromotionController::class, 'index']);
    Route::apiResource('filieres', FiliereController::class)->only(['store', 'update']);
    Route::apiResource('promotions', PromotionController::class)->only(['store', 'update']);
    Route::apiResource('utilisateurs', UtilisateurController::class)->except(['destroy', 'show']);

    Route::get('/alumni', [AlumniController::class, 'index']);
    Route::get('/alumni/{alumni}', [AlumniController::class, 'show']);
    Route::put('/alumni/{alumni}', [AlumniController::class, 'update']);

    foreach (['stages' => StageController::class, 'emplois' => EmploiController::class] as $resource => $controller) {
        Route::get('/'.$resource, [$controller, 'index'])->name($resource.'.index');
        Route::post('/'.$resource, [$controller, 'store'])->name($resource.'.store');
        Route::get('/'.$resource.'/{id}', [$controller, 'show'])->name($resource.'.show');
        Route::put('/'.$resource.'/{id}', [$controller, 'update'])->name($resource.'.update');
        Route::delete('/'.$resource.'/{id}', [$controller, 'destroy'])->name($resource.'.destroy');
    }

    Route::apiResource('entreprises', EntrepriseController::class);
    Route::get('/statistiques', StatistiqueController::class);
    Route::get('/rapports', [RapportController::class, 'index']);
    Route::post('/rapports', [RapportController::class, 'store']);
    Route::post('/activites', [ActiviteController::class, 'store']);
    Route::put('/activites/{activite}', [ActiviteController::class, 'update']);
    Route::delete('/activites/{activite}', [ActiviteController::class, 'destroy']);

    Route::get('/participations/moi', [ParticipationController::class, 'mine']);
    Route::post('/activites/{activite}/inscriptions', [ParticipationController::class, 'register']);
    Route::get('/activites/{activite}/participations', [ParticipationController::class, 'attendees']);
    Route::delete('/participations/{participation}', [ParticipationController::class, 'cancel']);
    Route::patch('/participations/{participation}/presence', [ParticipationController::class, 'attendance']);
});
