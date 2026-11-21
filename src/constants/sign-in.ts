const signInMessages = {
  invalid:
    "The email or password is incorrect. Use your employee email and ask your administrator to reset your password if needed.",
  unconfirmed:
    "Your email still needs confirmation. Ask your administrator to confirm your login account.",
  inactive: "Your employee record is inactive. Contact your administrator.",
  ineligible:
    "Your login does not match an active employee record. Ask your administrator to check your employee email and account setup.",
  "rate-limited": "Too many sign-in attempts. Wait a moment and try again.",
  unavailable:
    "Sign-in is temporarily unavailable. Try again in a few minutes.",
};

export type SignInFailure = keyof typeof signInMessages;

export function getSignInMessage(status: string | undefined) {
  if (status && Object.hasOwn(signInMessages, status)) {
    return signInMessages[status as SignInFailure];
  }
  return undefined;
}
