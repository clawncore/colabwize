import React from "react";
import googleDriveLogo from "../../assets/google-drive.png";

interface GoogleDriveIconProps {
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

export const GoogleDriveIcon: React.FC<GoogleDriveIconProps> = ({
  className,
  width = 24,
  height = 24,
  style,
}) => {
  return (
    <img
      src={googleDriveLogo}
      alt="Google Drive"
      width={width}
      height={height}
      className={className}
      style={{ display: "inline-block", ...style }}
      draggable={false}
    />
  );
};

export default GoogleDriveIcon;
