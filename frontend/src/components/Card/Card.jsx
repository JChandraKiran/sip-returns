import React from "react";

export default function Card({ children, style = {}, className }) {
  const defaultStyle = {
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
    backgroundColor: "#fff",
  };

  return (
    <div style={{ ...defaultStyle, ...style }} className={className}>
      {children}
    </div>
  );
}
