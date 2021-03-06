angular.module('managementController', [])

.controller('managementCtrl', function(User){
    var app = this;
    
    app.loading = true;
    app.accessDenied = true;
    app.errorMsg = false;
    app.editAccess = false;
    app.deleteAccess = false;
    app.limit = 5;
    
    function getUsers(){
        User.getUsers().then(function(data){
            if(data.data.success){
                if(data.data.permission === 'admin' || data.data.permission === 'moderator'){
                    app.users = data.data.users;
                    app.loading =  false;
                    app.accessDenied = false;
                    
                    if(data.data.permission === 'admin'){
                        app.editAccess = true;
                        app.deleteAccess = true;    
                    }else if(data.data.permission === 'moderator'){
                        app.editAccess = true;
                    }
                    }else{
                    app.errorMsg = "Insufficient permission";
                    app.loading = false;
                }
    
            }else{
                app.errorMsg = data.data.message;
                app.loading = false;
            }
        });
    }

    getUsers();
    

    app.showMore = function(number){
        app.showMoreError = false;

        if(number > 0){
            app.limit = number;
        }else{
            app.showMoreError = "Please enter a valid number";
        }
    };
    
    app.showAll = function(){
        app.limit = undefined;
        app.showMoreError = false;
    };

    app.deleteUser = function(username){
        User.deleteUser(username).then(function(data){
            if(data.data.success){
                getUsers();
            }else{
                app.showMoreError = data.data.message;
            }
        });
    }
})


.controller('editCtrl', function($scope, $routeParams, User, $timeout){
    var app = this;
    $scope.nameTab = 'active';
    app.phase1 = true;

    User.getUser($routeParams.id).then(function(data){
        if(data.data.success){
            $scope.newName = data.data.user.name;
            app.currentUser = data.data.user._id;
        }else{
            app.errorMsg = data.data.message;
        }
    });

    app.namePhase = function(){
        $scope.nameTab = 'active';
        $scope.usernameTab = 'default';
        $scope.emailTab = 'default';
        $scope.permissionsTab = 'default';
        app.phase1 = true;
        app.phase2 = false;
        app.phase3 = false;
        app.phase4 = false;
    };

    app.usernamePhase = function(){
        $scope.nameTab = 'default';
        $scope.usernameTab = 'active';
        $scope.emailTab = 'default';
        $scope.permissionsTab = 'default';
        app.phase1 = false;
        app.phase2 = true;
        app.phase3 = false;
        app.phase4 = false;
    };

    app.emailPhase = function(){
        $scope.nameTab = 'default';
        $scope.usernameTab = 'default';
        $scope.emailTab = 'active';
        $scope.permissionsTab = 'default';
        app.phase1 = false;
        app.phase2 = false;
        app.phase3 = true;
        app.phase4 = false;
    };

    app.permissionsPhase = function(){
        $scope.nameTab = 'default';
        $scope.usernameTab = 'default';
        $scope.emailTab = 'default';
        $scope.permissionsTab = 'active';
        app.phase1 = true;
    };

    
    app.updateName = function(newName, valid){
        app.errorMsg = false;
        app.disabled = true;
        var userObject = {};

        
        if(valid){
            userObject._id = app.currentUser;
            userObject.name = $scope.newName;
            User.editUser(userObject).then(function(data){
                if(data.data.success){
                    app.successMsg = data.data.message;
                    $timeout(function(){
                        app.nameForm.name.$setPristine();
                        app.nameForm.name.$setUntouched();
                        app.successMsg = false;
                        app.disabled = false;
                    }, 2000);
                }else{
                    app.errorMsg = data.data.message;
                    app.disabled = false;
                }
            });
 
        }else{
            app.errorMsg = "Please ensure form is filled out properly.";
            app.disabled = false;
        }
    };
});