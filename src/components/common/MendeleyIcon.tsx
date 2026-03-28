import React from 'react';
import mendeleyImg from "../../assets/mendeley-icon.png";

interface MendeleyIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const MendeleyIcon: React.FC<MendeleyIconProps> = ({ className, width = 24, height = 24 }) => {
  return (
    <img
      src={mendeleyImg}
      alt="Mendeley"
      width={width}
      height={height}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
};

export default MendeleyIcon;
