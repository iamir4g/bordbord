export default {
  routes: [
    {
      method: "POST",
      path: "/otp-auth/send-code",
      handler: "otp-auth.sendCode",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/otp-auth/verify-code",
      handler: "otp-auth.verifyCode",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/otp-auth/set-password",
      handler: "otp-auth.setPassword",
      config: {
        auth: {},
      },
    },
  ],
};
