var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');
var titlize  = require('mongoose-title-case');
var validate = require('mongoose-validator');

// name validator
var nameValidator = [
    validate({
        validator: 'matches',
        arguments: /^([a-zA-Z]{3,30})+(( [a-zA-Z]{3,30})+)*$/ ,
        message  : "Name must be atleast 3 characters, do not use special characters or numbers."
      }),

      validate({
        validator: 'isLength',
        arguments: [3, 30],
        message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
      })  
  ];


// email validator
  var emailValidator = [
    validate({
        validator: 'isEmail',
        message  : "Is not a valid mail"
      }),

    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
      })    
  ];


// username validator
var usernameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
      }),
      
    validate({
        validator: 'isAlphanumeric',
        passIfEmpty: true,
        message: 'Username should contain alpha-numeric characters only'
      })      
  ];

var passwordValidator = [
    validate({
        validator: 'matches',
        arguments: /^(?=.*\d).{8,25}$/ ,
        message  : "Password must be between 8 and 25 digits long and include at least one numeric character."
      }),

      validate({
        validator: 'isLength',
        arguments: [6, 30],
        message: 'password should be between {ARGS[0]} and {ARGS[1]} characters'
      }) 
  ];



var UserSchema = new Schema({
    name: { type: String, required: true, validate: nameValidator },
    username: { type: String, lowercase: true, required: true, unique: true, validate: usernameValidator },
    password: { type: String, required: true, validate: passwordValidator, select: false },
    email: { type: String, lowercase: true, required: true, unique: true, validate: emailValidator },
    active: { type: Boolean, required: true, default: false },
    temporarytoken: { type: String, required: true },
    resettoken: { type: String, required: false },
    permission: { type: String, required: true, default: 'user' },
    picture: { type: Schema.Types.Mixed, required: true }
});


UserSchema.pre('save', function(next){
    var user = this;

    if(!user.isModified('password')) return next();

    bcrypt.hash(user.password, null, null,function(err, hash){
        if(err) return next(err);
        user.password = hash;
        next();
    });
});

UserSchema.plugin(titlize, {
    paths: [ 'name' ]
  });

UserSchema.methods.comparePassword = function(password ){
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);



