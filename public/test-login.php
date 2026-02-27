<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$request = Illuminate\Http\Request::create('/login', 'POST', [
    'email' => 'superadmin@example.com',
    'password' => 'password',
]);

try {
    $response = $app->make(Illuminate\Contracts\Http\Kernel::class)->handle($request);
    echo "Status: " . $response->getStatusCode() . "\n";
    if ($response->getStatusCode() == 500) {
        if ($response->exception) {
            echo "Exception: " . $response->exception->getMessage() . "\n";
            echo $response->exception->getTraceAsString();
        } else {
            echo $response->getContent();
        }
    }
} catch (\Throwable $e) {
    echo "Fatal Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
