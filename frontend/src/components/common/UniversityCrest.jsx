import React from 'react';

/**
 * Classical University Crest Emblem for ConnectU
 * Uses Deep Navy (#0F2942), Primary Blue (#1769E8), and Accent Blue (#58A6FF)
 */
export const UniversityCrest = ({ className = "w-12 h-12", variant = "navy" }) => {
  return (
    <svg
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ConnectU University Crest"
    >
      {/* Outer Shield Border */}
      <path
        d="M50 4C72 4 92 12 92 34C92 72 50 104 50 104C50 104 8 72 8 34C8 12 28 4 50 4Z"
        fill={variant === 'gold' || variant === 'blue' ? '#EAF3FF' : variant === 'white' ? '#FFFFFF' : '#0F2942'}
        stroke={variant === 'white' ? '#D9E2EC' : '#58A6FF'}
        strokeWidth="2.5"
      />

      {/* Inner Shield Inset */}
      <path
        d="M50 9C68 9 86 16 86 35C86 68 50 98 50 98C50 98 14 68 14 35C14 16 32 9 50 9Z"
        fill={variant === 'gold' || variant === 'blue' ? '#F5F9FD' : variant === 'white' ? '#FDFDFD' : '#123B60'}
        stroke={variant === 'white' ? '#58A6FF' : '#58A6FF'}
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />

      {/* Academic Open Book Icon */}
      <path
        d="M32 38C38 36 46 36 50 40C54 36 62 36 68 38V60C62 58 54 58 50 62C46 58 38 58 32 60V38Z"
        fill={variant === 'gold' || variant === 'white' ? '#0F2942' : '#FFFFFF'}
        stroke="#58A6FF"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Book Center spine */}
      <line
        x1="50"
        y1="40"
        x2="50"
        y2="62"
        stroke="#58A6FF"
        strokeWidth="1.5"
      />

      {/* Academic Star of Excellence */}
      <path
        d="M50 20L52.5 25L58 26L54 30L55 35.5L50 33L45 35.5L46 30L42 26L47.5 25L50 20Z"
        fill="#58A6FF"
      />

      {/* Classical Laurel Leaves Left & Right */}
      <path
        d="M26 62C24 66 26 71 30 74C28 70 29 65 33 63"
        stroke="#58A6FF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M74 62C76 66 74 71 70 74C72 70 71 65 67 63"
        stroke="#58A6FF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* University Latin Motto Ribbon */}
      <path
        d="M25 80C34 83 42 84 50 84C58 84 66 83 75 80C73 86 65 89 50 89C35 89 27 86 25 80Z"
        fill="#58A6FF"
      />

      <circle cx="50" cy="84" r="1.5" fill="#0F2942" />
    </svg>
  );
};

export default UniversityCrest;
