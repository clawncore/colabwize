import React from "react";

interface GoogleDriveIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const GoogleDriveIcon: React.FC<GoogleDriveIconProps> = ({ 
  className, 
  width = 24, 
  height = 24 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 87.3 78" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Green left side */}
      <path d="M6.6 66.85L3.3 61.35 29.1 15.6H57.9L31.65 61.35z" fill="#0F9D58"/>
      {/* Yellow right side */}
      <path d="M57.9 15.6L84 61.35H31.65L57.9 15.6z" fill="#FFCD40"/>
      {/* Blue bottom */}
      <path d="M31.65 61.35H84L71.7 78H18.3z" fill="#4285F4"/>
      {/* Dark green overlap (left-top intersection) */}
      <path d="M29.1 15.6L43.5 39.45 57.9 15.6H29.1z" fill="#188038"/>
      {/* Red overlap (right-bottom intersection) */}
      <path d="M57.85 61.35L71.7 78H84L57.85 61.35z" fill="#EA4335"/>
      {/* Dark blue overlap (left-bottom intersection) */}
      <path d="M6.6 66.85L18.3 78H31.65L6.6 66.85z" fill="#1A73E8"/>
    </svg>
  );
};

export default GoogleDriveIcon;
