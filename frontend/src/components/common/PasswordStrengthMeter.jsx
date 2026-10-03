import React from 'react';
import { Check, X } from 'lucide-react';

export const calculateStrength = (password = '') => {
  if (!password) return { score: 0, label: 'Too short', color: 'bg-border', checks: [] };

  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Both uppercase & lowercase letters', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'At least one number (0-9)', met: /\d/.test(password) },
    { label: 'At least one symbol (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.met).length;

  let label = 'Weak';
  let color = 'bg-status-error';
  let textColor = 'text-status-error';

  if (score === 2) {
    label = 'Fair';
    color = 'bg-status-warning';
    textColor = 'text-status-warning';
  } else if (score === 3) {
    label = 'Good';
    color = 'bg-accent';
    textColor = 'text-accent-hover';
  } else if (score === 4) {
    label = 'Strong (Campus Standard)';
    color = 'bg-status-success';
    textColor = 'text-status-success';
  }

  return { score, label, color, textColor, checks };
};

export const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null;

  const { score, label, color, textColor, checks } = calculateStrength(password);

  return (
    <div className="mt-2 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary font-medium">Security Strength:</span>
        <span className={`font-semibold ${textColor}`}>{label}</span>
      </div>

      {/* 4-Segment Strength Bar */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-sm transition-all duration-300 ${
              step <= score ? color : 'bg-ivory-300'
            }`}
          />
        ))}
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[11px] text-text-secondary">
        {checks.map((check, idx) => (
          <div key={idx} className="flex items-center space-x-1.5">
            {check.met ? (
              <Check className="w-3.5 h-3.5 text-status-success flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            )}
            <span className={check.met ? 'text-text-primary' : 'text-text-muted'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
