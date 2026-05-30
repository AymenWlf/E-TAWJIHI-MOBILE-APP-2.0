/** Politique mot de passe — alignée sur le web (RegisterPage) et le backend. */

export type AccountPasswordRules = {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
};

export function evaluateAccountPassword(password: string): AccountPasswordRules {
  return {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
}

export function isStrongAccountPassword(password: string): boolean {
  return Object.values(evaluateAccountPassword(password)).every(Boolean);
}
