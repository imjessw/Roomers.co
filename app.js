
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose= require('mongoose');
var config = require('./oauth.js');
console.log(config)
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

// seralize and deseralize
passport.serializeUser(function(user, done) {
 done(null, user);
});
passport.deserializeUser(function(obj, done) {
 done(null, obj);
});

// config
passport.use(new FacebookStrategy({
   clientID: config.fb.clientID,
   clientSecret: config.fb.clientSecret,
   callbackURL: config.fb.callbackURL
},
function(accessToken, refreshToken, profile, done) {
 process.nextTick(function () {
 	console.log(profile)
   return done(null, profile);
 });
}
));

var app = express();

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.cookieParser());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'my_precious' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
   

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
mongoose.connect('mongodb://localhost/roomer');
var dummyUserID= "527c26321400f0f857000001"

var roomersInfo= mongoose.model('roomer',{
	oauthID: Number,
	name: String,
	email: String,
	age: Number,
	currentLoc: String,
	moveTo: String,
	months: Number,
	ageMin: Number,
	ageMax: Number

});
var roomerGet = function(req, res){
	roomersInfo.find({}, function(err, data){
		res.render('index', {roomerIndiv: data})
	});
	// step 1 find all roomers
	// in the callback call res. render on index view and pass it retieved roomers (what is currently in the db)
}
var roomerPost = function(req, res){ 
	var appdata=req.body;
	var roomerIndiv= new roomersInfo({
		name:req.body.name,
		email:req.body.email,
		age:req.body.age,
		currentLoc: req.body.currentLoc, 
		moveTo:req.body.moveTo,
		months:req.body.months,
		ageMin: req.body.ageMin,
		ageMax: req.body.ageMax
	})	
	console.log("req.body came through!", req.body.age)
	roomerIndiv.save(function(err){
		// roomersinfo.find() --- mongoose doc
	// if (!err)
		// console.log(err)
		console.log("before render");
		// roomerGet(req,res);
		res.redirect("/searchroomers")
		console.log(roomerIndiv);

	});
};
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/roomer',roomerGet);
app.post('/roomer',roomerPost);
app.get('/account', ensureAuthenticated, function(req, res){
 res.render('account', { user: req.user });
});
app.get('/login', function(req, res){
 res.render('login', { user: req.user });
});

app.get('/auth/facebook',
 passport.authenticate('facebook'),
function(req, res){
});
app.get('/auth/facebook/callback', 
 passport.authenticate('facebook', { failureRedirect: '/' }),
function(req, res) {
 res.redirect('/account');
});
app.get('/logout', function(req, res){
 req.logout();
res.redirect('/');
});

app.get('/roomerprofile',function(req, res){
	res.send("this is where to go for editing your profile")
})
app.get('/searchrooms',function(req, res){
	res.send("searching for avalible rooms")
})
app.get('/message',function(req, res){
	res.send("messaging service between roomers")
})
app.get('/searchroomers',function(req,res){
	console.log("BEFORE")
	roomersInfo.findById(dummyUserID,function(err,user){
		console.log("AFTER",err,user)
		roomersInfo.find({age:{$gte:user.ageMin}}, function(err, roomers){
			console.log("AHAHAHAHAH!",err, roomers)
			res.render("searchRoomers",{roomerIndiv: roomers})
		})
	})
})
// test authentication
function ensureAuthenticated(req, res, next) {
 if (req.isAuthenticated()) { return next(); }
res.redirect('/login')
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
