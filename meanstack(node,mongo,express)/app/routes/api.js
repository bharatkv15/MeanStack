var User        = require('../models/user');
var jwt         = require('jsonwebtoken');
var secret      = 'harryporter';
var nodemailer  = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');


module.exports = function(router){



    var options = {
        auth: {
            api_user: 'themeanstack1',
            api_key: 'Sargamwa27@'
        }
    }

    var client = nodemailer.createTransport(sgTransport(options));


// http://localhost:8080/api/users
// USER REGISTRATION
router.post('/users', function(req, res){
    var user = new User();
    user.username       = req.body.username;
    user.password       = req.body.password;
    user.email          = req.body.email;
    user.name           = req.body.name;
    user.profile     = req.body.profile;
    user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
    if(req.body.username == null || req.body.username == "" || req.body.password == null || req.body.password == "" || req.body.email == null || req.body.email == "" || req.body.name == null || req.body.name == ""){
        res.json({ success:false, message:"Ensure all fields are filled properly" });
    }else{
        user.save(function(err){
            if(err){
                if(err.errors != null){
                    if(err.errors.name){
                        res.json({ success:false, message: err.errors.name.message });
                    }else if(err.errors.email){
                        res.json({ success:false, message: err.errors.email.message });
                    }else if(err.errors.username){
                        res.json({ success:false, message: err.errors.username.message });
                    }else if(err.errors.password){
                        res.json({ success:false, message: err.errors.password.message });
                    }else{
                        res.json({ success:false, message: err });
                    }
                }else if(err){
                    if(err.code == 11000){
                        res.json({ success:false, message: "Username or email is already taken." });
                    }else{
                        res.json({ success:false, message: err });
                    }
                    }
                }else{
                    var email = {
                        from: 'Localhost Staf, staff@localhost.com',
                        to: user.email ,
                        subject: 'Localhost activation link',
                        text: 'Hello ' + user.name + ' Thank you for registering + Localhost.com  . Please click on the link below to complete your activation: http://localhost:8080/activate/' + user.temporarytoken,
                        html: 'Hello <strong>' + user.name + '<strong>,<br<br> Thank you for registering Localhost.com. Please click on the link below to complete your activation:<br> <a href="http://localhost:8080/activate/' + user.temporarytoken + '">http://localhost:8080/activate/</a>'                      
                    };
                
                    client.sendMail(email, function(err, info){
                        if (err){
                        console.log(err);
                        }
                        else {
                        console.log('Message sent: ' + info.response);
                        }
                    });
                res.json({ success:true, message:"Acount registered! Please check your registred e-mail for activation link." });        
            }
        });
    }
});


//checkin if username exist
// router.post('/checkusername', function(req, res){
//     User.findOne({ username: req.body.username }).select('username').exec(function(err, user){
//         if(err) throw err;

//         if(user){
//             res.json({ success: false, message: "Username already exists." });
//         }else{
//             res.json({ success: true, message: "Valid username:" });
//         }
//     });
// });


// //checkin if email exist
// router.post('/checkemail', function(req, res){
//     User.findOne({ email: req.body.email }).select('email').exec(function(err, user){
//         if(err) throw err;

//         if(user){
//             res.json({ success: false, message: "E-mail already exists." });
//         }else{
//             res.json({ success: true, message: "Valid e-mail." });
//         }
//     });
// });





// http://localhost:8080/api/authenticate
// USER LOGIN
router.post('/authenticate', function(req, res){
    User.findOne({ username: req.body.username }).select(' email username password active').exec(function(err, user){
        if(err) throw err;

        if(!user){
            res.json({ success: false, message: "could not authenticate user" });
        }else if(user){
            if(req.body.password){
                var validPassword = user.comparePassword(req.body.password);
            }else{
                res.json({ success: false, message: 'no password provided' });
            }
            
            if(!validPassword){
                res.json({ success: false, message: 'could not authenticate password' });
            }else if(!user.active){
                res.json({ success: false, message: 'Account is not activated yet. Please check your email.', expired: true });
            }else{
                var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '30s' });
                res.json({ success: true, message: 'user authenticated', token: token });
            }
        }
    });
});


router.put('/activate/:token', function(req, res){
    User.findOne({ temporarytoken: req.params.token }, function(err, user){
        if(err) throw err;
        var token = req.params.token;

        jwt.verify(token, secret, function(err, decoded){
            if(err){
                res.json({ success: false, message: "Activation token hss expired." });
            }else if(!user){
                res.json({ success: false, message: "Activation token hss expired." });
            }else{
                user.temporarytoken = false;
                user.active = true;
                user.save(function(err){
                    if(err){
                        console.log(err);
                    }else{
                        var email = {
                            from: 'Localhost Staf, staff@localhost.com',
                            to: user.email ,
                            subject: 'Localhost account activated',
                            text: 'Hello ' + user.name + ', Your account has been successfully activated.',
                            html: 'Hello <strong>' + user.name + '<strong>,<br<br> Your account has been successfully activated'                      
                        };
                    
                        client.sendMail(email, function(err, info){
                            if (err ){
                            console.log(err);
                            }
                            else {
                            console.log('Message sent: ' + info.response);
                            }
                        });
                        res.json({ success: true, message: "Acount activated." });
                    }
                });
            }
        });
    });
});



router.post('/resend', function(req, res){
    User.findOne({ username: req.body.username }).select('username password active').exec(function(err, user){
        if(err) throw err;

        if(!user){
            res.json({ success: false, message: "could not authenticate user" });
        }else if(user){
            if(req.body.password){
                var validPassword = user.comparePassword(req.body.password);
            }else{
                res.json({ success: false, message: 'no password provided' });
            }
            
            if(!validPassword){
                res.json({ success: false, message: 'could not authenticate password' });
            }else if(user.active){
                res.json({ success: false, message: 'Account is already activated.' });
            }else{
                res.json({ success: true, user: user });
            }
        }
    });
});


router.put('/resend', function(req, res){
    User.findOne({ username: req.body.username }).select('username name email temporarytoken').exec(function(err, user){
        if(err) throw err;
        user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
        user.save(function(err){
            if(err){
                Console.log(err);
            }else{
                var email = {
                    from: 'Localhost Staf, staff@localhost.com',
                    to: user.email ,
                    subject: 'Localhost account activativation link request',
                    text: 'Hello ' + user.name + ' You recently requested new account activation link. Please click on the link below to complete your activation: http://localhost:8080/activate/' + user.temporarytoken,
                    html: 'Hello <strong>' + user.name + '<strong>,<br<br> You recently requested new account activation link. Please click on the link below to complete your activation:<br> <a href="http://localhost:8080/activate/' + user.temporarytoken + '">http://localhost:8080/activate/</a>'                      
                };
            
                client.sendMail(email, function(err, info){
                    if (err )   console.log(err);
                });
                res.json({ success: true, message: "Activation link is send to " + user.email + "!" });
            }
        });  
    });
});


router.get('/resetusername/:email', function(req, res){
    User.findOne({ email: req.params.email }).select('email name username').exec(function(err, user){
        if(err){
            res.json({ success: false, message: err });
        }else{
            if(!req.params.email){
                res.json({ success: false, message: "No e-mail was provided." });
            }else{
                if(!user){
                    res.json({ success: false, message: "E-mail does not found." });
                }else{
                    var email = {
                        from: 'Localhost Staf, staff@localhost.com',
                        to: user.email ,
                        subject: 'Localhost username request',
                        text: 'Hello ' + user.name + ' You recently requested your username. Please save it in your file ' + user.username,
                        html: 'Hello <strong>' + user.name + '<strong>,<br<br> You recently requested your username. Please save it in your file ' + user.username                      
                    };
                
                    client.sendMail(email, function(err, info){
                        if (err)  console.log(err);
                    });
                    res.json({ success: true, message: "Username has been sent to your email." });
                }
            }
        }
    });
});


router.put('/resetpassword', function(req, res){
    User.findOne({ username: req.body.username }).select( 'username active email resettoken name' ).exec(function(err, user){
        if(err) throw err;

        if(!user){
            res.json({ success: false, message: "Username was not found." });
        }else if(!user.active){
            res.json({ success: false, message: "Account has not yet been activated." });
        }else{
            user.resettoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
            user.save(function(err){
                if(err){
                    res.json({ success: false, message:err });
                }else{
                    var email = {
                        from: 'Localhost Staf, staff@localhost.com',
                        to: user.email ,
                        subject: 'Localhost password reset request',
                        text: 'Hello ' + user.name + ' You recently requested a password reset link. Please click on the link below to reset your password:<br><br> <a href="http://localhost:8080/reset/' + user.resettoken,
                        html: 'Hello <strong>' + user.name + '<strong>,<br<br> You recently requested a password reset link. Please click on the link below to reset your password:<br><br> <a href="http://localhost:8080/reset/' + user.resettoken + '">http://localhost:8080/reset/ </a>'                      
                    };
                
                    client.sendMail(email, function(err, info){
                        if (err )   console.log(err);
                    });
                    res.json({ success: true, message: "Please check your e-mail for password reset link." });
                }
            });
        }
    });
});


router.get('/resetpassword/:token', function(req, res){
    User.findOne({ resettoken: req.params.token }).select().exec(function(err, user){
        if(err) throw err;
        var token = req.params.token;

        jwt.verify(token, secret, function(err, decoded){
            if(err){
                res.json({ success: false, message: "Password link has expired." });
            }else{
                if(!user){
                    res.json({ success: false, message: "Password link has expired." });
                }else{
                    res.json({ success: true, user: user });    
                }
            }
        });
    });
});


////////Password is reset and save into the database//////////////////
router.put('/savepassword', function(req, res){
    User.findOne({ username: req.body.username }).select( 'username email name password resettoken' ).exec(function(err, user){
        if(err) throw err;        
        if(req.body.password == null || req.body.password == ''){
            res.json({ success: false, message: "Password not provided." });
        }else{
            user.password = req.body.password;
            user.resettoken = false;
            user.save(function(err){
                if(err){
                    res.json({ success: false, message: err });
                }else{

                var email = {
                    from: 'Localhost Staf, staff@localhost.com',
                    to: user.email ,
                    subject: 'Localhost password reset',
                    text: 'Hello ' + user.name + ' This email is to notify you that your password was recently reset at localhost.com.',
                    html: 'Hello <strong>' + user.name + '<strong>,<br<br> This email is to notify you that your password was recently reset at localhost.com.'
                };
        
                client.sendMail(email, function(err, info){
                    if (err )   console.log(err);
                });
                    res.json({ success: true, message: "Password has been reset!" });
                }
            });
        }
    });
});




router.use(function(req, res, next){
    var token = req.body.token || req.body.query || req.headers['x-access-token'];
    
    if(token){
        // verify token
        jwt.verify(token, secret, function(err, decoded){
            if(err){
                res.json({ success: false, message: "token invalid" });
            }else{
                req.decoded = decoded;
                next();
            }
        });
    }else{
        res.json({ success: false, message: "no token provided" });
    }
});



router.post('/me', function(req, res){

    res.json(req.decoded);
});


router.get('/renewToken/:username', function(req, res){
    User.findOne({ username: req.params.username }).select().exec(function(err, user){
        if(err) throw err;
        if(!user){
            res.json({ success: false, message: "No user was found." });
        }else{
            var newToken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
            res.json({ success: true, token: newToken });
        }
    });
});



router.get('/permission', function(req, res){
    User.findOne({ username: req.decoded.username }, function(err, user){
        if(err) throw err;
        if(!user){
            res.json({ success: false, message: "No user was found." });
        }else{
            res.json({ success: true, permission: user.permission });
        }
    });
});


router.get('/management', function(req, res){
    User.find({}, function(err, users){
        if(err) throw err;
        User.findOne({ username: req.decoded.username }, function(err, mainUser){
            if(err) throw err;
            if(!mainUser){
                res.json({ success: false, message: "No user was found." });
            }else{
                if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                    if(!users){
                        res.json({ success: false, message: "No user was found." });
                    }else{
                        res.json({ success: true, users: users, permission: mainUser.permission });
                    }           
                }else{
                    res.json({ success: false, permission: 'Insufficient Permission.' });
                }
            }
        });
    });
});


router.delete('/management/:username', function(req, res){
    var deleteUser = req.params.username;
    User.findOne({ username: req.decoded.username }, function(err, mainUser){
        if(err) throw err;
        if(!mainUser){
            res.json({ success: false, message: "No user found." });
        }else{
            if(mainUser.permission !== 'admin'){
                res.json({ success: false, message: "Insufficient Permissions." });
            }else{
                User.findOneAndRemove({ username: deleteUser }, function(err, user){
                    if(err) throw err;
                    res.json({ success: true });
                });
            }
        }
    });
});


router.get('/edit/:id', function(req, res){
    var editUser = req.params.id;
    User.findOne({ username: req.decoded.username }, function(err, mainUser){
        if(err) throw err;
        if(!mainUser){
            res.json({ success: false, message: "No user found." });
        }else{
            if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                User.findOne({ _id: editUser }, function(err, user){
                    if(err) throw err;
                    if(!user){
                        res.json({ success: false, message: "No user found." });
                    }else{
                        res.json({ success: true, user: user });
                    }
                });
            }else{
                res.json({ success: false, message: "Insufficient Permission." });
            }
        }
    });
});

router.put('/edit', function(req, res){
    var editUser = req.body._id;
    if(req.body.name) var newName = req.body.name;
    if(req.body.username) var newUsername = req.body.username;
    if(req.body.email) var newEmail = req.body.email;
    if(req.body.permission) var newPermission = req.body.permission;
    User.findOne({ username: req.decoded.username }, function(err, mainUser){
        if(err) throw err;
        if(mainUser){
            res.json({ success: false, message: "No user found" });
        }else{
            if(newName){
                if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                    User.findOne({ _id: editUser }, function(err, user){
                        if(err) throw err;
                        if(!user){
                            res.json({ success: false, message: "No user found" });
                        }else{
                            user.name = newName;
                            user.save(function(err){
                                if(err){
                                    console.log(err);
                                }else{
                                    res.json({ success: true, message: "Name has been updated" });
                                }
                            });
                        }
                    });
                }else{
                    res.json({ success: false, message: "Insufficient Permission." });
                }
            }
            if(newUsername){
                if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                    User.findOne({ _id: editUser }, function(err, user){
                        if(err) throw err;
                        if(!user){
                            res.json({ success: false, message: "No user found" });
                        }else{
                            user.username = newUsername;
                            user.save(function(err){
                                if(err){
                                    console.log(err);
                                }else{
                                    res.json({ success: true, message: "Username has been updated" });
                                }
                            });
                        }
                    });
                }else{
                    res.json({ success: false, message: "Insufficient Permission." });                    
                }
            }
            if(newEmail){
                if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                    User.findOne({ _id: editUser }, function(err, user){
                        if(err) throw err;
                        if(!user){
                            res.json({ success: false, message: "No user found" });
                        }else{
                            user.email = newEmail;
                            user.save(function(err){
                                if(err){
                                    console.log(err);
                                }else{
                                    res.json({ success: true, message: "Email has been updated" });
                                }
                            });
                        }
                    });
                }else{
                    res.json({ success: false, message: "Insufficient Permission." });                    
                }
            }
            if(newPermission){
                if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                    User.findOne({ _id: editUser }, function(err, user){
                        if(err) throw err;
                        if(!user){
                            res.json({ success: false, message: "No user found" });
                        }else{
                            if(newPermission === 'user'){
                                if(user.permission === 'admin'){
                                    if(mainUser.permission !== 'admin'){
                                        res.json({ success: false, message: "Insufficient Permission, you must be an admin to downgrade another admin." });
                                    }else{
                                        user.permission = newPermission;
                                        user.save(function(err){
                                            if(err){
                                                console.log(err);
                                            }else{
                                                res.json({ success: true, message: "Permission has been updated" });
                                            }
                                        });
                                    }
                                }else{
                                    user.permission = newPermission;
                                        user.save(function(err){
                                            if(err){
                                                console.log(err);
                                            }else{
                                                res.json({ success: true, message: "Permission has been updated" });
                                            }
                                        });
                                }
                            }
                            if(newPermission === 'moderator'){
                                if(user.permission === 'admin'){
                                    if(mainUser.permission !== 'admin'){
                                        res.json({ success: false, message: "Insufficient Permission, you must be an admin to downgrade another admin." });
                                    }else{
                                        user.permission = newPermission;
                                        user.save(function(err){
                                            if(err){
                                                console.log(err);
                                            }else{
                                                res.json({ success: true, message: "Permission has been updated" });
                                            }
                                        });       
                                    }
                                }else{
                                    user.permission = newPermission;
                                    user.save(function(err){
                                        if(err){
                                            console.log(err);
                                        }else{
                                            res.json({ success: true, message: "Permission has been updated" });
                                        }
                                    });
                                }
                            }
                            if(newPermission === 'admin'){
                                if(mainUser.permission === 'admin'){
                                    user.permission = newPermission;
                                    user.save(function(err){
                                        if(err){
                                            console.log(err);
                                        }else{
                                            res.json({ success: true, message: "Permission has been updated" });
                                        }
                                    });
                                }else{
                                    res.json({ success: false, message: "Insufficient Permission, you must be an admin to upgradr someone to the admin level." });
                                }
                            }
                        }
                    });
                }else{
                    res.json({ success: false, message: "Insufficient Permission." });                    
                }
            }
        }
    });
});


return router;
}



