import React from "react";
import zoteroImg from "../../assets/zotero-icon.png";

interface ZoteroIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const ZoteroIcon: React.FC<ZoteroIconProps> = ({ className, width = 24, height = 24 }) => {
  return (
    <div 
      className={className}
      style={{ 
        width, 
        height, 
        overflow: "hidden", 
        borderRadius: "22%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        flexShrink: 0
      }}
    >
      <img
        src={zoteroImg}
        alt="Zotero"
        style={{ 
          width: "125%", 
          height: "125%", 
          objectFit: "cover", 
          maxWidth: "none" 
        }}
      />
    </div>
  );
};

export default ZoteroIcon;
