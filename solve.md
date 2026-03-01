root@srv-35678264:/var/www/imarah# tail -100 /var/www/imarah/storage/logs/laravel.log
#50 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#51 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\\Foundation\\Http\\Middleware\\TransformsRequest->handle()
#52 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Foundation\\Http\\Middleware\\TrimStrings->handle()
#53 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#54 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Http\\Middleware\\ValidatePostSize->handle()
#55 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#56 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Foundation\\Http\\Middleware\\PreventRequestsDuringMaintenance->handle()
#57 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(61): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#58 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Http\\Middleware\\HandleCors->handle()
#59 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#60 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Http\\Middleware\\TrustProxies->handle()
#61 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#62 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Foundation\\Http\\Middleware\\InvokeDeferredCallbacks->handle()
#63 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#64 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Http\\Middleware\\ValidatePathEncoding->handle()
#65 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#66 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\\Pipeline\\Pipeline->then()
#67 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\\Foundation\\Http\\Kernel->sendRequestThroughRouter()
#68 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Application.php(1220): Illuminate\\Foundation\\Http\\Kernel->handle()
#69 /var/www/imarah/public/index.php(20): Illuminate\\Foundation\\Application->handleRequest()
#70 {main}

[previous exception] [object] (Illuminate\\Foundation\\ViteException(code: 0): Unable to locate file in Vite manifest: resources/js/Pages/Dashboard.tsx. at /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:999)
[stacktrace]
#0 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php(390): Illuminate\\Foundation\\Vite->chunk()
#1 /var/www/imarah/storage/framework/views/8243df5519eacfdd0435b771d055bc51.php(36): Illuminate\\Foundation\\Vite->**invoke()
#2 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(123): require('...')
#3 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(124): Illuminate\\Filesystem\\Filesystem::Illuminate\\Filesystem\\{closure}()
#4 /var/www/imarah/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(57): Illuminate\\Filesystem\\Filesystem->getRequire()
#5 /var/www/imarah/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\\View\\Engines\\PhpEngine->evaluatePath()
#6 /var/www/imarah/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\\View\\Engines\\CompilerEngine->get()
#7 /var/www/imarah/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\\View\\View->getContents()
#8 /var/www/imarah/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\\View\\View->renderContents()
#9 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\\View\\View->render()
#10 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\\Http\\Response->setContent()
#11 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\\Http\\Response->**construct()
#12 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\\Routing\\ResponseFactory->make()
#13 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(363): Illuminate\\Routing\\ResponseFactory->view()
#14 /var/www/imarah/vendor/inertiajs/inertia-laravel/src/Response.php(219): Illuminate\\Support\\Facades\\Facade::\_\_callStatic()
#15 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Routing/Router.php(921): Inertia\\Response->toResponse()
#16 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Illuminate\\Routing\\Router::toResponse()
#17 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Routing/Router.php(821): Illuminate\\Routing\\Router->prepareResponse()
#18 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(180): Illuminate\\Routing\\Router->Illuminate\\Routing\\{closure}()
#19 /var/www/imarah/app/Http/Middleware/EnsureUserIsActive.php(28): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#20 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): App\\Http\\Middleware\\EnsureUserIsActive->handle()
#21 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Auth/Middleware/EnsureEmailIsVerified.php(41): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#22 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Auth\\Middleware\\EnsureEmailIsVerified->handle()
#23 /var/www/imarah/app/Http/Middleware/SecurityHeaders.php(18): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#24 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): App\\Http\\Middleware\\SecurityHeaders->handle()
#25 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#26 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Http\\Middleware\\AddLinkHeadersForPreloadedAssets->handle()
#27 /var/www/imarah/vendor/inertiajs/inertia-laravel/src/Middleware.php(122): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#28 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Inertia\\Middleware->handle()
#29 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#30 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Routing\\Middleware\\SubstituteBindings->handle()
#31 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Auth/Middleware/Authenticate.php(63): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#32 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Auth\\Middleware\\Authenticate->handle()
#33 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#34 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Foundation\\Http\\Middleware\\VerifyCsrfToken->handle()
#35 /var/www/imarah/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#36 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\View\\Middleware\\ShareErrorsFromSession->handle()
#37 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(120): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#38 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(63): Illuminate\\Session\\Middleware\\StartSession->handleStatefulRequest()
#39 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Session\\Middleware\\StartSession->handle()
#40 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php(36): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#41 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Cookie\\Middleware\\AddQueuedCookiesToResponse->handle()
#42 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php(74): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#43 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Cookie\\Middleware\\EncryptCookies->handle()
#44 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#45 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Routing/Router.php(821): Illuminate\\Pipeline\\Pipeline->then()
#46 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Routing/Router.php(800): Illuminate\\Routing\\Router->runRouteWithinStack()
#47 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Routing/Router.php(764): Illuminate\\Routing\\Router->runRoute()
#48 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Routing/Router.php(753): Illuminate\\Routing\\Router->dispatchToRoute()
#49 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(200): Illuminate\\Routing\\Router->dispatch()
#50 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(180): Illuminate\\Foundation\\Http\\Kernel->Illuminate\\Foundation\\Http\\{closure}()
#51 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#52 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php(31): Illuminate\\Foundation\\Http\\Middleware\\TransformsRequest->handle()
#53 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Foundation\\Http\\Middleware\\ConvertEmptyStringsToNull->handle()
#54 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#55 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\\Foundation\\Http\\Middleware\\TransformsRequest->handle()
#56 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Foundation\\Http\\Middleware\\TrimStrings->handle()
#57 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#58 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Http\\Middleware\\ValidatePostSize->handle()
#59 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#60 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Foundation\\Http\\Middleware\\PreventRequestsDuringMaintenance->handle()
#61 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(61): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#62 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Http\\Middleware\\HandleCors->handle()
#63 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#64 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Http\\Middleware\\TrustProxies->handle()
#65 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#66 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Foundation\\Http\\Middleware\\InvokeDeferredCallbacks->handle()
#67 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#68 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(219): Illuminate\\Http\\Middleware\\ValidatePathEncoding->handle()
#69 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#70 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\\Pipeline\\Pipeline->then()
#71 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\\Foundation\\Http\\Kernel->sendRequestThroughRouter()
#72 /var/www/imarah/vendor/laravel/framework/src/Illuminate/Foundation/Application.php(1220): Illuminate\\Foundation\\Http\\Kernel->handle()
#73 /var/www/imarah/public/index.php(20): Illuminate\\Foundation\\Application->handleRequest()
#74 {main}
"}
root@srv-35678264:/var/www/imarah#

root@srv-35678264:/var/www/imarah# cat /var/www/imarah/public/build/manifest.json | grep -E "Error|Dashboard"
"\_Dashboard-ClPcxvvS.js": {
"file": "assets/Dashboard-ClPcxvvS.js",
"name": "Dashboard",
"resources/js/Components/Dashboard/FinancialChart.tsx"
"\_InputError-CAm41msc.js": {
"file": "assets/InputError-CAm41msc.js",
"name": "InputError",
"resources/js/Components/Dashboard/FinancialChart.tsx": {
"src": "resources/js/Components/Dashboard/FinancialChart.tsx",
"\_Dashboard-ClPcxvvS.js",
"\_InputError-CAm41msc.js",
"\_InputError-CAm41msc.js",
"\_InputError-CAm41msc.js",
"\_InputError-CAm41msc.js",
"resources/js/Pages/Error.tsx": {
"file": "assets/Error-DZkyG2oi.js",
"name": "Error",
"src": "resources/js/Pages/Error.tsx",
"\_InputError-CAm41msc.js",
"\_InputError-CAm41msc.js",
"\_InputError-CAm41msc.js",
"\_InputError-CAm41msc.js",
"\_InputError-CAm41msc.js",
"\_InputError-CAm41msc.js",
"\_InputError-CAm41msc.js",
"\_InputError-CAm41msc.js",
"\_InputError-CAm41msc.js",
"\_InputError-CAm41msc.js",
"\_InputError-CAm41msc.js",
"\_InputError-CAm41msc.js",
"\_Dashboard-ClPcxvvS.js",
"resources/js/Pages/Error.tsx",
root@srv-35678264:/var/www/imarah#

root@srv-35678264:/var/www/imarah# ls -lah /var/www/imarah/public/build/assets/ | grep -iE "error|dashboard"
-rw-r--r-- 1 root root 21K Mar 1 22:34 Dashboard-ClPcxvvS.js
-rw-r--r-- 1 root root 1.6K Mar 1 22:34 Error-DZkyG2oi.js
-rw-r--r-- 1 root root 687 Mar 1 22:34 InputError-CAm41msc.js
root@srv-35678264:/var/www/imarah#
