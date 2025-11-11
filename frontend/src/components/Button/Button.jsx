import React from "react";
import "./Button.css";

function Button({
  children,
  onClick,
  type = "button",
  disabled,
  style,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius: "5px",
        padding: "5px 10px",
        cursor: "pointer",

        ...style,
      }}
      className={`button-${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
