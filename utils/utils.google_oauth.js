const passport = require("passport");
const passport_google = require("passport-google-oauth20");

const dotenv = require("dotenv");
dotenv.config();

const GoogleStrategy = passport_google.Strategy;

passport.use(new GoogleStrategy(
	{
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: process.env.GOOGLE_OAUTH_REDIRECT_URI,
	},
	function (accessToken, refreshToken, profile, done)
	{
		return done(null, profile);
	}
));

passport.serializeUser(function (user, done)
{
	done(null, user);
});

passport.deserializeUser(function (user, done)
{
	done(null, user);
});

module.exports = passport;
