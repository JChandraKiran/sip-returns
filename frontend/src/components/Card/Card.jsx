import React from "react";
import { colors } from "../../utils/colors";

export default function Card({ children, style = {}, className }) {
  const defaultStyle = {
    borderRadius: "15px",
    padding: "20px",
    backgroundColor: colors.bgCard,
    boxSizing: "border-box",
    // border: `1px solid ${colors.gray300}`,
  };

  return (
    <div style={{ ...defaultStyle, ...style }} className={className}>
      {children}
    </div>
  );
}
