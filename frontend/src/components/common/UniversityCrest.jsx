import React from 'react';

/**
 * University / SkyLine Crest Emblem
 * Supports 'skyline' (modern shield with laurel wreath, star, and open book)
 * as well as legacy variants 'navy', 'gold', 'blue', 'white'.
 */
export const UniversityCrest = ({ className = "w-12 h-12", variant = "skyline", color = "#1d4ed8" }) => {
  if (variant === 'skyline' || variant === 'official' || variant === 'white') {
    return (
      <img
        src="/skyline-emblem.png"
        alt="SkyLine Official Logo"
        className={`${className} object-contain`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  if (variant === 'shield') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="SkyLine Organization Portal Crest"
      >
        {/* Shield Outer Outline */}
        <path
          d="M50 13 C68 13 78 18 80 32 C82 55 65 74 50 84 C35 74 18 55 20 32 C22 18 32 13 50 13 Z"
          stroke={color}
          strokeWidth="2.4"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Vertical stem line under the star */}
        <line
          x1="50"
          y1="25"
          x2="50"
          y2="39"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Star of Excellence */}
        <path
          d="M50 19 L51.6 23.4 L56.2 23.7 L52.7 26.6 L53.7 31 L50 28.6 L46.3 31 L47.3 26.6 L43.8 23.7 L48.4 23.4 Z"
          fill={color}
        />

        {/* Open Book in Deep Blue */}
        <path
          d="M34 43.5 C39.5 41.5 45.5 42.5 49.5 45 C53.5 42.5 59.5 41.5 65 43.5 C65.5 43.7 66 44.2 66 44.8 V61.5 C66 62.3 65.2 62.9 64.5 62.7 C59.5 61 54 62 50 64.5 C46 62 40.5 61 35.5 62.7 C34.8 62.9 34 62.3 34 61.5 V44.8 C34 44.2 34.5 43.7 34 43.5 Z"
          fill={color}
        />
        {/* Center Spine Divider */}
        <line
          x1="50"
          y1="45"
          x2="50"
          y2="64.5"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Left Laurel Branch Stem */}
        <path
          d="M21 72 C15 62 14.5 47 20 35"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Left Laurel Leaves */}
        {/* Pair 1 - Bottom */}
        <path d="M19 70 C14 70 11 66 14 63 C16.5 65.5 19 67.5 19 70 Z" fill={color} />
        <path d="M21 68 C20 64 21 61 24 61 C24 64 23 67 21 68 Z" fill={color} />
        {/* Pair 2 - Mid-low */}
        <path d="M18.5 60 C13.5 60 11 56 14 53 C16.5 55.5 18.5 57.5 18.5 60 Z" fill={color} />
        <path d="M20 58 C19.5 54 21 51 24 51 C23.5 54 22 57 20 58 Z" fill={color} />
        {/* Pair 3 - Middle */}
        <path d="M19 50 C14 50 12 46 15 43 C17.5 45.5 19 47.5 19 50 Z" fill={color} />
        <path d="M21 48 C20.5 44 22 41 25 41 C24.5 44 23 47 21 48 Z" fill={color} />
        {/* Pair 4 - Upper */}
        <path d="M21 40 C17 39 15 35 18 33 C20 35.5 21.5 38 21 40 Z" fill={color} />
        <path d="M23 38 C23 34 25 31 27.5 32 C27 34.5 25.5 37 23 38 Z" fill={color} />

        {/* Right Laurel Branch Stem */}
        <path
          d="M79 72 C85 62 85.5 47 80 35"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Right Laurel Leaves */}
        {/* Pair 1 - Bottom */}
        <path d="M81 70 C86 70 89 66 86 63 C83.5 65.5 81 67.5 81 70 Z" fill={color} />
        <path d="M79 68 C80 64 79 61 76 61 C76 64 77 67 79 68 Z" fill={color} />
        {/* Pair 2 - Mid-low */}
        <path d="M81.5 60 C86.5 60 89 56 86 53 C83.5 55.5 81.5 57.5 81.5 60 Z" fill={color} />
        <path d="M80 58 C80.5 54 79 51 76 51 C76.5 54 78 57 80 58 Z" fill={color} />
        {/* Pair 3 - Middle */}
        <path d="M81 50 C86 50 88 46 85 43 C82.5 45.5 81 47.5 81 50 Z" fill={color} />
        <path d="M79 48 C79.5 44 78 41 75 41 C75.5 44 77 47 79 48 Z" fill={color} />
        {/* Pair 4 - Upper */}
        <path d="M79 40 C83 39 85 35 82 33 C80 35.5 78.5 38 79 40 Z" fill={color} />
        <path d="M77 38 C77 34 75 31 72.5 32 C73 34.5 74.5 37 77 38 Z" fill={color} />
      </svg>
    );
  }

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

