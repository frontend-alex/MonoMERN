import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { Loading } from "@/components/feedback/loading";
import { TitleWrapper } from "@/components/meta/title-wrapper";

import AuthGuard from "@/features/auth/guards/auth-guard";
import RootGuard from "@/features/auth/guards/root-guard";

import RootLayout from "@/components/layouts/root-layout";

import { Dashboard, Profile, Settings } from "@/pages/(root)";
import { AuthCallback, ForgotPassword, LandingPage, Login, Otp, Register, ResetPassword } from "@/pages/(auth)";

import { ROUTES } from "@/config/routes";
import { DotBackground } from "@/components/ui/backgrounds/dot-background";

const App = () => {
  return (
    <Suspense fallback={<Loading />}>
      <DotBackground className="absolute top-0 h-[50dvh] -z-1" />
      <Routes>

        {/* Public Routes */}
        <Route
          path={ROUTES.PUBLIC.LANDING}
          element={
            <TitleWrapper title="Landing Page">
              <LandingPage />
            </TitleWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.VERIFY_EMAIL}
          element={
            <TitleWrapper title="Verify Email">
              <Otp />
            </TitleWrapper>
          }
        />

        {/* Public Routes */}
        <Route element={<AuthGuard />}>
          <Route
            path={ROUTES.PUBLIC.LOGIN}
            element={
              <TitleWrapper title="Login Page">
                <Login />
              </TitleWrapper>
            }
          />
          <Route
            path={ROUTES.PUBLIC.REGISTER}
            element={
              <TitleWrapper title="Register Page">
                <Register />
              </TitleWrapper>
            }
          />
          <Route
            path={ROUTES.PUBLIC.FORGOT_PASSWORD}
            element={
              <TitleWrapper title="Recover Page">
                <ForgotPassword />
              </TitleWrapper>
            }
          />
          <Route
            path={ROUTES.PUBLIC.RESET_PASSWORD}
            element={
              <TitleWrapper title="Recover Page">
                <ResetPassword />
              </TitleWrapper>
            }
          />
          <Route
            path={ROUTES.PUBLIC.AUTH_CALLBACK}
            element={
              <TitleWrapper title="Verifying...">
                <AuthCallback />
              </TitleWrapper>
            }
          />
        </Route>


        {/* Authenticated Routes */}
        <Route element={<RootGuard />}>
          <Route element={<RootLayout />}>
            <Route
              path={ROUTES.BASE.APP}
              element={
                <TitleWrapper title="Dashboard Page">
                  <Dashboard />
                </TitleWrapper>
              }
            />
            <Route
              path={ROUTES.AUTHENTICATED.PROFILE}
              element={
                <TitleWrapper title="Dashboard Page">
                  <Profile />
                </TitleWrapper>
              }
            />
            <Route
              path={ROUTES.AUTHENTICATED.SETTINGS}
              element={
                <TitleWrapper title="Settings Page">
                  <Settings />
                </TitleWrapper>
              }
            />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
