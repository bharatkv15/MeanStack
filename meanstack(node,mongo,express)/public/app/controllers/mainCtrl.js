angular.module('mainController', ['authServices', 'userServices'])

.controller('mainCtrl', function(Auth, User, $location, $timeout, $rootScope, $window, $interval, $route, AuthToken){
 
    var app = this;   
    app.lodeme = false;

    app.checkSession = function(){
        if(Auth.isLoggedIn()){
            app.checkingSession = true;
            var interval = $interval(function(){
                var token = $window.localStorage.getItem('token');
                if(token == null){
                    $interval.cancel(interval);
                }else{
                    self.parseJwt = function(token){
                        var base64Url = token.split('.')[1];
                        var base64 = base64Url.replace('-', '+').replace('_', '/');
                        return JSON.parse($window.atob(base64));
                    }
                    var expireTime = self.parseJwt(token);
                    var timeStamp = Math.floor(Date.now() / 1000);
                    // console.log(expireTime.exp);
                    // console.log(timeStamp);
                    var timeCheck = expireTime.exp - timeStamp;
                    // console.log('timeCheck: ' + timeCheck);
                    if(timeCheck <= 25){
                        // console.log("token has expired");
                        showModal(1);
                        $interval.cancel(interval);
                    }else{
                        // console.log("token has not yet expired");
                    }
                }
            }, 2000);
        }
    };


    app.checkSession();


    var showModal = function(option){
        app.choiceMade  = false;
        app.modalHeader = undefined;
        app.modalBody   = undefined;
        app.hideButton  = false;

        if(option === 1){
            app.modalHeader = "Timeout Warning";
            app.modalBody = "Your session willexpired in 5 seconds. Would you like to renew your session ?";       
            $("#myModal").modal({backdrop: "static"});
        }else if(option === 2){
            app.hideButton = true;
            app.modalHeader = "Logging out";
            $("#myModal").modal({backdrop: "static"});
            $timeout(function(){
                Auth.logout();
                $location.path('/homeLogout');
                hideModel();
                $route.reload();
            }, 2000);
        }
        $timeout(function(){
            if(!app.choiceMade){
                hideModel();
            }
        }, 4000);
    };


    app.renewSession = function(){
        app.choiceMade = true;
        User.renewSession(app.username).then(function(data){
            if(data.data.success){
                AuthToken.setToken(data.data.token);
                app.checkSession();
            }else{
                app.modalBody = data.data.message;
            }
        });
        hideModel();
    };

    app.endSession = function(){
        app.choiceMade = true;
        hideModel();
        $timeout(function(){
            showModal(2);
        }, 1000);
    };

    var hideModel = function(){
        $("#myModal").modal('hide');
    };



    $rootScope.$on('$routeChangeStart', function(){
        
        if(!app.checkingSession) app.checkSession();

        if(Auth.isLoggedIn()){
            app.isLoggedIn = true;
            Auth.getUser().then(function(data){
                app.username  = data.data.username;
                app.useremail = data.data.email;


                User.getPermission().then(function(data){
                    if(data.data.permission === 'admin' || data.data.permission === 'moderator'){
                        app.authorized = true;
                        app.lodeme = true;
                    }else{
                        app.lodeme = true;
                    }
                });
            });
        }else{
            app.isLoggedIn = false;
            app.username = '';
            app.lodeme = true;
        }
        if($location.hash() == '_=_') $location.hash(null);
    });

    this.facebook = function(){
        app.disabled = true;
        $window.location = $window.location.protocol + "//" + $window.location.host + "/auth/facebook";
    };

    // this.google = function(){
    //     $window.location = $window.location.protocol + "//" + $window.location.host + "/auth/google";
    // };



    this.doLogin = function(loginData){
        app.loading = true;
        app.errorMsg = false;
        app.successMsg = false;
        app.expired = false;
        app.disabled = true;
    
        // $http.post('/api/users', this.regData)---userServices.js
        Auth.login(app.loginData).then(function(data){
            if(data.data.success){
                app.loading = false;
                //print success message
                app.successMsg = data.data.message + '...redirecting...';
                //redirect to home page
                $timeout(function(){
                    $location.path('/home');
                    app.loginData = '';
                    app.successMsg = false;
                    app.checkSession();
                }, 2000);
            
                }else{
                if(data.data.expired){
                    app.expired = true;
                    app.loading = false;
                    //print error message
                    app.errorMsg = data.data.message;
                }else{
                    app.loading = false;
                    app.disabled = true;
                    //print error message
                    app.errorMsg = data.data.message;
                }
                }           
            });
        };
        


        ///////////// Logout function//////////// 
        app.logout = function(){
        showModal(2);
        };

    });


