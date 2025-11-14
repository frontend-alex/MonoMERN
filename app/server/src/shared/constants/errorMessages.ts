export const AUTH_ERRORS = {
  UNAUTHORIZED: {
    errorCode: "AUTH_001",
    statusCode: 401,
    message: "Unauthorized access.",
    userMessage: "You must be logged in to perform this action.",
  },
  FORBIDDEN_ACCESS: {
    errorCode: "AUTH_002",
    statusCode: 403,
    message: "Forbidden access.",
    userMessage: "You do not have permission to access this resource.",
  },
  INVALID_CREDENTIALS: {
    errorCode: "AUTH_003",
    statusCode: 401,
    message: "Invalid email or password.",
    userMessage: "The login information you provided is incorrect.",
  },
  INVALID_CURRENT_PASSWORD: {
    errorCode: "AUTH_004",
    statusCode: 400,
    message: "Current password is incorrect.",
    userMessage: "The current password you entered is incorrect.",
  },
  SAME_PASSWORD: {
    errorCode: "AUTH_005",
    statusCode: 400,
    message: "New password cannot be the same as the current password.",
    userMessage: "Please choose a different password.",
  },
  EMAIL_ALREADY_TAKEN: {
    errorCode: "AUTH_016",
    statusCode: 400,
    message: "Email is already in use.",
    userMessage: "This email is already taken. Please use another.",
  },
  ACCOUNT_ALREADY_CONNECTED_WITH_PROVIDER: {
    errorCode: "AUTH_018",
    statusCode: 400,
    message: "Account already registered using a third-party provider.",
    userMessage:
      "This email is already linked to a social login. Please sign in using that provider instead.",
  },
  EMAIL_NOT_VERIFIED: {
    errorCode: "AUTH_006",
    statusCode: 403,
    message: "Email has not been verified.",
    userMessage: "Please verify your email before continuing.",
  },
  EMAIL_NOT_PROVIDED: {
    errorCode: "AUTH_007",
    statusCode: 400,
    message: "Email is required.",
    userMessage: "Please provide your email address.",
  },
  PASSWORD_MISSING: {
    errorCode: "AUTH_008",
    statusCode: 400,
    message: "Password is required.",
    userMessage: "Please enter your password.",
  },
  EMAIL_ALREADY_VERIFIED: {
    errorCode: "AUTH_009",
    statusCode: 400,
    message: "Email is already verified.",
    userMessage: "Your email is already verified.",
  },

  // New auth errors for registration/login flows:
  REGISTRATION_FAILED: {
    errorCode: "AUTH_010",
    statusCode: 500,
    message: "Failed to register user.",
    userMessage: "We couldn’t complete your registration. Please try again.",
  },
  LOGIN_FAILED: {
    errorCode: "AUTH_011",
    statusCode: 401,
    message: "Login failed due to invalid credentials or other issues.",
    userMessage:
      "Login failed. Please check your email and password and try again.",
  },
  USER_ALREADY_EXISTS: {
    errorCode: "AUTH_012",
    statusCode: 400,
    message: "User with this email or username already exists.",
    userMessage: "An account with this email or username already exists.",
  },
  USERNAME_ALREADY_TAKEN: {
    errorCode: "AUTH_013", // Changed from USER_002 to AUTH_013 to keep the namespace consistent
    statusCode: 400,
    message: "Username is already in use.",
    userMessage: "This username is already taken. Please choose another.",
  },
  PASSWORD_RESET_FAILED: {
    errorCode: "AUTH_014",
    statusCode: 500,
    message: "Failed to reset password.",
    userMessage: "We couldn’t reset your password. Please try again later.",
  },
  ACCOUNT_LOCKED: {
    errorCode: "AUTH_015",
    statusCode: 403,
    message: "Account is locked due to multiple failed login attempts.",
    userMessage:
      "Your account has been locked. Please try again later or contact support.",
  },
  EMAIL_NOT_REGISTERED: {
    errorCode: "AUTH_017",
    statusCode: 404,
    message: "Email is not registered.",
    userMessage: "We couldn’t find an account with this email address.",
  },
};

export const JWT_ERRORS = {
  INVALID_TOKEN: {
    errorCode: "JWT_001",
    statusCode: 401,
    message: "Invalid or expired token.",
    userMessage: "Your session has expired. Please log in again.",
  },
  INVALID_REFRESH_TOKEN: {
    errorCode: "JWT_002",
    statusCode: 401,
    message: "Invalid or expired refresh token.",
    userMessage: "Your session has expired. Please log in again.",
  },
  REFRESH_FAILED: {
    errorCode: "JWT_003",
    statusCode: 403,
    message: "Token refresh failed.",
    userMessage: "We couldn't refresh your session. Please log in again.",
  },
  INVALID_ENCRYPTED_TOKEN: {
    errorCode: "JWT_004",
    statusCode: 400,
    message: "Invalid encrypted token.",
    userMessage: "Authentication failed. Please try logging in again.",
  },
};

export const OTP_ERRORS = {
  OTP_EXPIRED: {
    errorCode: "OTP_001",
    statusCode: 400,
    message: "OTP has expired.",
    userMessage: "Your OTP has expired. Please request a new one.",
  },
  INVALID_OTP: {
    errorCode: "OTP_002",
    statusCode: 400,
    message: "Invalid OTP code.",
    userMessage: "The OTP code you entered is invalid.",
  },
  OTP_NOT_FOUND: {
    errorCode: "OTP_003",
    statusCode: 404,
    message: "OTP not found.",
    userMessage: "No OTP was found for your request. Please try again.",
  },
  OTP_SEND_FAILED: {
    errorCode: "OTP_004",
    statusCode: 500,
    message: "Failed to send OTP.",
    userMessage: "We couldn't send the OTP. Please try again later.",
  },
  OTP_ALREADY_USED: {
    errorCode: "OTP_005",
    statusCode: 400,
    message: "OTP has already been used.",
    userMessage: "This OTP has already been used. Please request a new one.",
  },
  OTP_CLEANUP_FAILED: {
    errorCode: "OTP_006",
    statusCode: 500,
    message: "Failed to cleanup expired OTPs.",
    userMessage: "Failed to cleanup expired OTPs.",
  },
};

export const STRIPE_ERRORS = {
  PAYMENT_FAILED: {
    errorCode: "STRIPE_001",
    statusCode: 402,
    message: "Payment processing failed.",
    userMessage: "Your payment could not be processed. Please try again.",
  },
  INVOICE_CREATION_FAILED: {
    errorCode: "STRIPE_002",
    statusCode: 500,
    message: "Invoice creation failed.",
    userMessage: "We couldn't create your invoice. Please try again.",
  },
  SUBSCRIPTION_CREATION_FAILED: {
    errorCode: "STRIPE_003",
    statusCode: 500,
    message: "Subscription creation failed.",
    userMessage: "Failed to create your subscription. Please try again.",
  },
  INVALID_PLAN_ID: {
    errorCode: "STRIPE_004",
    statusCode: 400,
    message: "Invalid Stripe plan ID.",
    userMessage: "The selected plan is not valid. Please choose another.",
  },
  CUSTOMER_CREATION_FAILED: {
    errorCode: "STRIPE_005",
    statusCode: 500,
    message: "Stripe customer creation failed.",
    userMessage: "We couldn’t create your customer profile. Please try again.",
  },
  SUBSCRIPTION_UPGRADE_REQUIRED: {
    errorCode: "STRIPE_006",
    statusCode: 403,
    message: "Upgrade required for this feature.",
    userMessage: "Please upgrade your plan to access this feature.",
  },
};

export const GOOGLE_ERRORS = {
  GOOGLE_AUTH_FAILED: {
    errorCode: "GOOGLE_001",
    statusCode: 401,
    message: "Google authentication failed.",
    userMessage:
      "We couldn’t sign you in with Google. Try again or use another method.",
  },
};

export const USER_ERRORS = {
  USER_NOT_FOUND: {
    errorCode: "USER_001",
    statusCode: 404,
    message: "User not found.",
    userMessage: "We couldn’t find a user with that information.",
  },
  NO_UPDATES_PROVIDED: {
    errorCode: "USER_002",
    statusCode: 400,
    message: "No update fields provided.",
    userMessage: "Please provide at least one field to update.",
  },
};

export const EMAIL_ERRORS = {
  EMAIL_SENDING_FAILED: {
    errorCode: "EMAIL_001",
    statusCode: 500,
    message: "Failed to send email.",
    userMessage: "We couldn’t send the email. Please try again later.",
  },
};

export const DATABASE_ERRORS = {
  DATABASE_ERROR: {
    errorCode: "DB_001",
    statusCode: 500,
    message: "A database error occurred.",
    userMessage: "There was a problem accessing the database. Try again later.",
  },
};

export const NOTIFICATION_ERRORS = {
  NOTIFICATION_CREATION_FAILED: {
    errorCode: "NOTIF_001",
    statusCode: 500,
    message: "Failed to create notification.",
    userMessage: "We couldn’t create the notification. Please try again.",
  },
};

export const ERROR_MESSAGES = {
  ...AUTH_ERRORS,
  ...JWT_ERRORS,
  ...OTP_ERRORS,
  ...STRIPE_ERRORS,
  ...GOOGLE_ERRORS,
  ...USER_ERRORS,
  ...EMAIL_ERRORS,
  ...DATABASE_ERRORS,
  ...NOTIFICATION_ERRORS,
};
