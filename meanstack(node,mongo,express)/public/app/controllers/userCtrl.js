angular.module('userControllers', ['userServices'])

.controller('regCtrl', function($http, $location, $timeout, User){

    var app = this;

    this.regUser = function(regData, valid, confirmed){
        app.errorMsg = false;
        app.successMsg = false;
        app.loading = true;
        app.disabled = true;
        
        // $http.post('/api/users', this.regData)---userServices.js
        
        if(valid){
            User.create(this.regData).then(function(data){
                if(data.data.success){
                    app.loading = false;
                    //print success message
                    app.successMsg = data.data.message + '...redirecting...';
                    //redirect to home page
                    // $timeout(function(){
                    //     $location.path('/');
                    // }, 2000);
                    
                }else{
                    app.loading = false;
                    app.disabled = false;        
                    //print error message
                    app.errorMsg = data.data.message;
                    }
            });
        }else{
            app.loading = false;
            app.disabled = false;
            //print error message
            app.errorMsg = "Please ensure that form in filled out correctly.";
            }        
        
        };

    // this.checkUsername = function(regData){
    //     this.checkUsername(app.regData).then(function(data){
    //         console.log(data);
    //     });
    // }

    // User.chechEmail(regData)
})


.directive('match', function() {
    return {
        restrict: 'A',
        controller: function($scope){
            $scope.confirmed = false;

            $scope.doConfirm = function(values){
                values.forEach(function(ele){
                    if($scope.confirm == ele){
                        $scope.confirmed = true;
                    }else{
                        $scope.confirmed = false;
                    }

                });
            }
        },
        link: function(scope, elements, attrs){
            attrs.$observe('match', function(){
                scope.matches = JSON.parse(attrs.match);
                scope.doConfirm(scope.matches);
            });
            
            scope.$watch('confirm', function(){
                scope.matches = JSON.parse(attrs.match);
                scope.doConfirm(scope.matches);
            });
        }
    };
})



.controller('facebookCtrl', function($routeParams, Auth, $location, $window){

    var app = this;
    app.errorMsg = false;
    app.disabled = true;
    // app.expired = false;
    
    if($window.location.pathname == '/facebookerror'){
        app.errorMsg = "facebook id not found into database";
    }else if($window.location.pathname == '/facebook/inactive/error'){
        app.expired = true;
        app.errorMsg = 'Account is not activated yet. Please check your email.';
    }else{        
    Auth.facebook($routeParams.token);
    $location.path('/');
    }    
})





/////////////////////////////////////////////email controllers////////////////////////////////////////////////////////////////


// emailcrtl(need to work)
.controller('emailCtrl', function($routeParams, User, $timeout, $location){

    app = this;

    User.activaAccount($routeParams.token).then(function(data){
        app.successMsg = false;
        app.errorMsg = false;

        if(data.data.success){
            app.successMsg = data.data.message + "....redirecting.";
            $timeout(function(){
                $location.path('/login')
            }, 2000);
        }else{
            app.errorMsg = data.data.message + "....redirecting.";
            $timeout(function(){
                $location.path('/login')
            }, 2000);
        }
    });
})


// resendController - resend activation link (emailController)
.controller('resendCtrl', function(User){
    app = this;
    app.checkCredentials = function(loginData){
        app.errorMsg = false;
        app.successMsg = false;
        app.disabled = true;

        User.checkCredentials(app.loginData).then(function(data){
            if(data.data.success){
                User.resendLink(app.loginData).then(function(data){
                    if(data.data.success){
                        app.successMsg = data.data.message;
                    }
                });
            }else{
                app.disabled = false;
                app.errorMsg = data.data.message;
            }
        });;
    };

})


.controller('usernameCtrl', function(User){
    app = this;
    app.sendUsername = function(userData, valid){
        app.errorMsg = false;
        app.loading  = true;
        app.disabled = true;

        if(valid){
            User.sendUsername(app.userData.email).then(function(data){
                app.loading  = false;
                if(data.data.success){
                    app.successMsg = data.data.message;
                }else{
                    app.disabled = false;
                    app.errorMsg = data.data.message;
                }
            });
        }else{
            app.disabled = false;
            app.loading  = false;
            app.errorMsg = "Please enter a valid e-mail."
        }
    };
})


.controller('passwordCtrl', function(User){
    app = this;
    app.sendPassword = function(resetData, valid){
        app.errorMsg = false;
        app.loading  = true;
        app.disabled = true;

        if(valid){
            User.sendPassword(app.resetData).then(function(data){
                app.loading  = false;
                if(data.data.success){
                    app.successMsg = data.data.message;
                }else{
                    app.disabled = false;
                    app.errorMsg = data.data.message;
                }
            });
        }else{
            app.disabled = false;
            app.loading  = false;
            app.errorMsg = "Please enter a valid username.";
        }
    };
})

.controller('resetCtrl', function(User, $routeParams, $scope){
    app = this;
    app.hide = true;

    User.resetUser($routeParams.token).then(function(data){
        if(data.data.success){
            app.hide = false;
            app.successMsg = "Please enter a new password.";
            $scope.username = data.data.user.username;
        }else{
            app.errorMsg = data.data.message;
        }
    });

    app.savePassword = function(regData, valid, confirmed){
        app.errorMsg = false;
        app.disabled = true;
        app.loading  = true;

        if(valid && confirmed){
            app.regData.username = $scope.username;
            User.savePassword(app.regData).then(function(data){
                app.loading = false;
                if(data.data.success){
                    app.successMsg = data.data.message;
                }else{
                    app.loading  = false;
                    app.disabled = false;
                    app.errorMsg = data.data.message;
                }
            });
        }else{
            app.loading  = false;
            app.disabled = false;
            app.errorMsg = "Please ensure form is filled out properly.";
        }
    }
});




















// .controller('googleCtrl', function($routeParams, Auth, $location, $window){

//     var app = this;
    
//     if($window.location.pathname == '/googleerror'){
//         app.errorMsg = "google id not found into database";
//     }else{        
//     Auth.facebook($routeParams.token);
//     $location.path('/');
//     }    
// })