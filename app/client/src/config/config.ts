export const CONIFG = {};

export const API = {
  AUTH: {
    PUBLIC: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      FORGOT_PASSWORD: "/auth/reset-password",
      SEND_OTP: "/auth/send-otp",
      VALIDATE_OTP: "/auth/validate-otp",
      PROVIDERS: "/auth/providers",
      REFRESH: "/auth/refresh",
    },
    PRIVATE: {
      LOGOUT: "/auth/logout",
      VALIDATE_OTP: "/auth/validate-otp",
      CHANGE_PASSWORD: "/auth/change-password",
      UPDATE_PASSWORD: "/auth/update-password",
    },
  },
  USER: {
    GET_ME: "/user/me",
    UPDATE_ME: "/user/update",
    DELETE_ME: "/user/delete",
  },
};
