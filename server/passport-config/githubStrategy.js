const GitHubStrategy = require("passport-github2").Strategy;

function githubStrategy(passport) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/github/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile); // Profile contains the authenticated GitHub user
      }
    )
  );
}

module.exports = githubStrategy;
