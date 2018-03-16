angular.module('authServices', [])

.factory('Auth', function($http, AuthToken){
   var authFactory = {};

    // User.create(loginData)
    authFactory.login = function(loginData){
       return $http.post('/api/authenticate', loginData).then(function(data){
            AuthToken.setToken(data.data.token);
            return data;
       });
   };

    // Auth.isLoggedIn() ----to invoke isLoggedIn() function
    authFactory.isLoggedIn = function(){
       if(AuthToken.getToken()){
           return true;
       }else{
           return false;
       }
   };

    // Auth.facebook(token);
   authFactory.facebook = function(token){
       AuthToken.setToken(token);
   }

    // Auth.getUser ----invoke the Auth.getUser function
    authFactory.getUser = function(){
        if(AuthToken.getToken){
            return $http.post('/api/me');
        }else{
            $q.reject({ message: "user has no token" });
        }
    };

    // Auth.logout()
    authFactory.logout = function(){
       AuthToken.setToken();
   };
   
    return authFactory;
})

.factory('AuthToken', function($window){
    var authTokenFactory = {};
 
    // AuthToken.setToken(); ----To invoke setToken function
    authTokenFactory.setToken = function(token){
        if(token){
            $window.localStorage.setItem('token', token);
        }else{
            $window.localStorage.removeItem('token');
        }
    };

    // AuthToken.getToken(); ----To invoke setToken function
    authTokenFactory.getToken = function(){
        return $window.localStorage.getItem('token');
    };
    
    return authTokenFactory;
 })


.factory('AuthInterceptors', function(AuthToken){
    var authInterceptorsFactory = {};

    authInterceptorsFactory.request = function(config){

        var token = AuthToken.getToken();

        if(token){
            config.headers['x-access-token'] = token;
        }

        return config;
    };


    return authInterceptorsFactory;
});
