import React from 'react';

export const CustomPin = ({ className, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    {...props}
  >
    <path d="M7 14h10v-1.5a2 2 0 0 0-1-1.7l-0.5-.5A2 2 0 0 1 14 8.5V5h1a1 1 0 0 0 0-2h-6a1 1 0 0 0 0 2h1v3.5a2 2 0 0 1-1.5 1.8l-0.5 .5a2 2 0 0 0-1 1.7Z" />
    <line x1="12" y1="14" x2="12" y2="22" />
  </svg>
);

export const CustomPinOff = ({ className, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    {...props}
  >
    <path d="M7 14h10v-1.5a2 2 0 0 0-1-1.7l-0.5-.5A2 2 0 0 1 14 8.5V5h1a1 1 0 0 0 0-2h-6a1 1 0 0 0 0 2h1v3.5a2 2 0 0 1-1.5 1.8l-0.5 .5a2 2 0 0 0-1 1.7Z" />
    <line x1="12" y1="14" x2="12" y2="22" />
    <line x1="4" y1="4" x2="20" y2="20" />
  </svg>
);
