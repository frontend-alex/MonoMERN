import passport from "passport";

import { AccountProviders } from "shared/types/user";
import { strategies } from "@/modules/auth/auth.providers";
import { userRepository } from "@/modules/users/user.repository";


strategies
  .filter((s) => s.enabled)
  .forEach(({ Strategy, config, label }) => {
    passport.use(
      new Strategy(
        config,
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const username =
              profile.displayName ||
              profile.username ||
              email ||
              "unknown-user";

            if (!email)
              return done(null, false, { message: "No email provided" });

            let user = await userRepository.findByEmail(email);

            if (!user) {
              user = await userRepository.createOAuthUser(
                username,
                email,
                label as AccountProviders,
              );
            }

            return done(null, user);
          } catch (err) {
            return done(err, false);
          }
        },
      ),
    );
  });

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userRepository.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
