var express    = require('express');
var app        = express();
var port       = process.env.PORT || 8080;
var path       = require("path");
var morgan     = require('morgan');
var mongoose   = require('mongoose');
var bodyParser = require('body-parser');
var router     = express.Router();
var appRoutes  = require('./app/routes/api')(router);
var passport   = require('passport');
var social     = require('./app/passport/passport')(app, passport);

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/api', appRoutes);


mongoose.connect('mongodb://localhost:27017/tutorials', function(err){
    if(err){
        console.log("MongoDB is not connected !" + err);
    }else {
        console.log("Sucessfully connected with mongodb !");
    }
});

app.get('*', function(req, res){
    res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});



app.listen(port, function(){
    console.log("Server is running on port number: " + port);
});

