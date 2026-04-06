import clsx from "clsx";

import { config } from "@shared/config/config";
import { CheckCircle, XCircle } from "lucide-react";

// eslint-disable-next-line react-refresh/only-export-components
export const getPasswordChecks = (password: string) => {
  const rules = config.user.passwordRules;

  return [
    {
      label: "At least " + rules.minLength + " characters",
      isValid: password.length >= rules.minLength,
      allowed: config.user.passwordRules.minLength,
    },
    {
      label: "Uppercase letter",
      isValid: !rules.requireUppercase || /[A-Z]/.test(password),
      allowed: config.user.passwordRules.requireUppercase,
    },
    {
      label: "Lowercase letter",
      isValid: !rules.requireLowercase || /[a-z]/.test(password),
      allowed: config.user.passwordRules.requireLowercase,
    },
    {
      label: "Number",
      isValid: !rules.requireNumber || /[0-9]/.test(password),
      allowed: config.user.passwordRules.requireNumber,
    },
    {
      label: "Special character",
      isValid: !rules.requireSymbol || /[^a-zA-Z0-9]/.test(password),
      allowed: config.user.passwordRules.requireSymbol,
    },
  ];
};

type Props = {
  password: string;
};

const PasswordStrengthChecks: React.FC<Props> = ({ password }) => {
  const checks = getPasswordChecks(password);

  return (
    <div className="grid grid-cols-3 gap-2">
      {checks.map((check, index) => {
        return (
          check.allowed && (
            <div key={index} className="flex items-center gap-2">
              {check.isValid ? (
                <CheckCircle className="text-green-400 w-3 h-3" />
              ) : (
                <XCircle className="text-red-400 w-3 h-3" />
              )}
              <span
                className={clsx("transition-colors text-xs", {
                  "text-green-400": check.isValid,
                  "text-red-400": !check.isValid,
                })}
              >
                {check.label}
              </span>
            </div>
          )
        );
      })}
    </div>
  );
};

export default PasswordStrengthChecks;
