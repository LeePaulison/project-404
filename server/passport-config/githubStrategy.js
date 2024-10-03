const GitHubStrategy = require("passport-github").Strategy;
const User = require("../schemas/user");

module.exports = (passport) => {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/github/callback", // Make sure this URL is correct
        passReqToCallback: true, // Allows us to pass the req object to the callback
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({ githubUserId: profile.id });
          if (existingUser) {
            return done(null, existingUser);
          }

          const newUser = new User({
            githubUserId: profile.id,
            githubUsername: profile.username,
            createdAt: new Date(),
          });
          await newUser.save();
          done(null, newUser);
        } catch (error) {
          console.error("Error in GitHub strategy callback:", error);
          return done(error, null);
        }
      }
    )
  );
};
