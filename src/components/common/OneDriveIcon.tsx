import React from "react";

interface OneDriveIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const OneDriveIcon: React.FC<OneDriveIconProps> = ({ 
  className, 
  width = 24, 
  height = 24 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 18" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Back cloud (darker blue) */}
      <path d="M9.5 2C6.46 2 3.93 4.07 3.25 6.88C1.36 7.55 0 9.34 0 11.5C0 14.26 2.24 16.5 5 16.5H19C21.76 16.5 24 14.26 24 11.5C24 9.08 22.28 7.06 19.96 6.59C19.12 3.96 16.56 2 13.5 2C12.12 2 10.83 2.42 9.76 3.14" fill="#094AB2"/>
      {/* Front-left cloud (medium blue) */}
      <path d="M9.5 5C7.08 5 5.06 6.72 4.59 9.04C2.89 9.39 1.59 10.86 1.5 12.64C1.5 12.76 1.5 12.88 1.5 13C1.5 15.21 3.29 17 5.5 17H12L5.5 10L9.5 5z" fill="#0364B8"/>
      {/* Front-right cloud (bright blue) */}
      <path d="M13.5 5C11.7 5 10.12 5.93 9.28 7.35L5.5 10L12 17H19.5C21.71 17 23.5 15.21 23.5 13C23.5 10.79 21.71 9 19.5 9C19.17 9 18.85 9.04 18.54 9.11C17.84 6.73 15.85 5 13.5 5z" fill="#0078D4"/>
      {/* Overlap highlight (sky blue) */}
      <path d="M9.28 7.35C8.81 8.13 8.5 9.03 8.5 10C8.5 10.34 8.54 10.68 8.61 11L12 17L18.54 9.11C17.84 6.73 15.85 5 13.5 5C11.7 5 10.12 5.93 9.28 7.35z" fill="#1490DF"/>
      {/* Bottom highlight */}
      <path d="M4.59 9.04C4.56 9.19 4.53 9.35 4.51 9.5C4.5 9.67 4.5 9.83 4.5 10C4.5 10.34 4.54 10.68 4.61 11L8.61 11L5.5 10L4.59 9.04z" fill="#28A8EA"/>
    </svg>
  );
};

export default OneDriveIcon;
