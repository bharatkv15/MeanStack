var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuthStrategy;
var User             = require('../models/user');
var session          = require('express-session');
var jwt              = require('jsonwebtoken');
var secret           = 'harryporter';


module.exports = function(app, passport){

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: false } }));

    passport.serializeUser(function(user, done) {
        
        if(user.active){
            token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
        }else{
            token = 'inactive/error';
        }

        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });

    passport.use(new FacebookStrategy({
        clientID: '964884800329696',
        clientSecret: '241885dedbc8cc4f2e2c34b8f73f391c',
        callbackURL: "http://localhost:8080/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email']
      },
      function(accessToken, refreshToken, profile, done) {      
        User.findOne({ email: profile._json.email }).select(' username active password email ').exec(function(err, user){
            if(err) done(err);

            if(user && user != null){
                done(null, user);
            }else{
                done(null);
            }
        });
        
      }
    ));

    // passport.use(new GoogleStrategy({
    //     consumerKey: '603650211351-gstiqoks6st3q1qoojd3r1tmm84gmc3k.apps.googleusercontent.com',
    //     consumerSecret: 'SKftKhTwoZI254Uq3hh_aa0V',
    //     callbackURL: "http://localhost:8080/auth/google/callback"
    // },
    // function(token, tokenSecret, profile, done) {
    //     console.log(profile);

    //     User.findOne({ email: profile.emails[0].value }).select(' username password email ').exec(function(err, user){
    //         if(err) done(err);

    //         if(user && user != null){
    //             done(null, user);
    //         }else{
    //             done(null);
    //         }
    //     });
        
    //   }
    // ));
    // app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'profile', 'email'] }));

    // app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/googleerror' }), function(req, res) {
    //     res.redirect('/googleerror' + token);
    // });



    app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebookerror' }), function(req, res){
        res.redirect('/facebook/' + token);
    });
  
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));


    return passport;
}

