import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

import {
  CLIENT_ID,
  CLIENT_SECRET,
  JWT_SECRET,
  PORT,
  REDIRECT_URI,
} from "../config/env.js";
import User from "../models/user.model.js";

GoogleStrategy.Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: REDIRECT_URI,
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log(
        "🐛 Mongoose connection state:",
        mongoose.connection.readyState
      );

      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
            isVerified: profile.emails?.[0]?.verified || false,
            provider: profile.provider,
          });

          await newUser.save();
          user = newUser;
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
          const error = new Error("Email does not exist");
          error.statusCode = 410;
          return done(
            { message: "Email does not exist", statusCode: 410 },
            false
          );
          //  throw error;
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);

        if (!isMatch) {
          const error = new Error("Password is incorrect");
          error.statusCode = 401;
          return done(
            { message: "User or Password is incorrect", statusCode: 401 },
            false
          );
          //  throw error;
        }
        done(null, existingUser.id);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    console.log("JWT payload:", jwt_payload);
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

passport.serializeUser(function (userId, done) {
  done(null, userId);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
