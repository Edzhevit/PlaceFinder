// require libraries
require("dotenv").config();
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var moment = require("moment");
var passport = require("passport");
var LogalStrategy = require("passport-local");
var methodOverride = require("method-override");
var expressSession = require("express-session");

// require models
var Place = require("./models/place");
var Comment = require("./models/comment");
var User = require("./models/user");

// require routes
var authRoutes = require("./routes/index");
var placeRoutes = require("./routes/places");
var commentRoutes = require("./routes/comments");
var reviewRoutes = require("./routes/reviews");

// config mongoose
mongoose.Promise = global.Promise;

mongoose.connect(process.env.DBURL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    .then(()=>console.log("DB server connect"))
    .catch(e => console.log("DB error", e));

// config libraries
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(expressSession({
    secret: "Favourite place is Sofia!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LogalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// add to all routes
app.use(async (req, res, next) => {
    res.locals.currentUser = req.user;
    if (req.user){
        try {
            var user = await User.findById(req.user._id).populate("notifications", null, {isRead: false}).exec();
            res.locals.notifications = user.notifications.reverse();
        } catch (err) {
            console.log(err.message)
        }
    }
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.moment = moment;
    next();
});

// refactor all routes
app.use(authRoutes);
app.use("/places", placeRoutes);
app.use("/places/:slug/comments", commentRoutes);
app.use("/places/:slug/reviews", reviewRoutes);

// config port to listen
app.listen(process.env.PORT, () => {
    console.log("PlaceFinder server has started!")
});