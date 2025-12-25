import React from "react";
import { colors } from "../utils/colors";

function TextInput({
  value,
  onChange,
  name,
  id,
  placeholder,
  disabled,
  type = "text",
  style,
  className,
}) {
  const defaultStyle = {
    width: "50%",
    padding: "6px 8px",
    fontSize: "14px",
    fontWeight: "500",
    color: colors.textPrimary,
    backgroundColor: colors.bgWhite,
    border: `2px solid ${colors.gray300}`,
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  };

  return (
    <input
      type={type}
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{ ...defaultStyle, ...style }}
      className={className}
      onFocus={(e) => {
        e.target.style.borderColor = colors.primary;
        e.target.style.boxShadow = `0 0 0 3px ${colors.primarySubtle}`;
      }}
      onBlur={(e) => {
        e.target.style.borderColor = colors.gray300;
        e.target.style.boxShadow = "none";
      }}
    />
  );
}

export default TextInput;
