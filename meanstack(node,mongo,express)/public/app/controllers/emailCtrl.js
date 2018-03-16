// angular.module('emailControllers', ['userServices'])
// .controller('emailCtrl', function($routeParams){
//     console.log($routeParams.token);
// })

////need to work ==========Uncaught Error: [$injector:modulerr] Failed to instantiate module userApp due to:
// Error: [$injector:modulerr] Failed to instantiate module emailCrl due to:
// Error: [$injector:nomod] Module 'emailCrl' is not available! You either misspelled the module name or forgot to load it. If registering a module ensure that you specify the dependencies as the second argument.
// http://errors.angularjs.org/1.6.6/$injector/nomod?p0=emailCrl
//     at http://localhost:8080/assets/js/angular.js:116:12
//     at http://localhost:8080/assets/js/angular.js:2297:17
//     at ensure (http://localhost:8080/assets/js/angular.js:2218:38)
//     at module (http://localhost:8080/assets/js/angular.js:2295:14)
//     at http://localhost:8080/assets/js/angular.js:4933:22
//     at forEach (http://localhost:8080/assets/js/angular.js:410:20)