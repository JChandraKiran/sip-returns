import React, { useState } from "react";
import { colors, shadows } from "../../utils/colors";

export default function Card({ children, style = {}, className }) {
  const [isHovered, setIsHovered] = useState(false);

  const defaultStyle = {
    borderRadius: "15px",
    padding: "20px",
    backgroundColor: colors.bgCard,
    boxSizing: "border-box",
  };

  // Hover effects that should always apply (not be overridden by parent styles)
  const hoverStyle = {
    boxShadow: isHovered ? shadows.lg : shadows.md,
    transition: "all 0.3s ease",
  };

  return (
    <div
      style={{ ...defaultStyle, ...style, ...hoverStyle }}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}
