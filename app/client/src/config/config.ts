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
    },
    PRIVATE: {
      LOGOUT: "/auth/logout",
      VALIDATE_OTP: "/auth/validate-otp",
      UPDATE_PASSWORD: "/auth/update-password",
      CHANGE_PASSWORD: "/auth/change-password",
    },
  },
  USER: {
    GET_ME: "/auth/me",
    UPDATE_ME: "/auth/update",
    DELETE_ME: "/auth/delete",
  },
};
