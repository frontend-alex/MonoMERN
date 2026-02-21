export const config = {
    app: {
        name: "MonoMERN",
    },
    user: {
        allowedUpdates: ['username', 'email', 'password', 'emailVerified'],
        passwordRules: {
            minLength: 6,
            requireUppercase: true,
            requireLowercase: true,
            requireNumber: true,
            requireSymbol: true,
        },
    },
    providers: {
        google: false,
        github: false,
        facebook: false,
        twitter: false,
        linkedin: false,
        instagram: false,
    }
}