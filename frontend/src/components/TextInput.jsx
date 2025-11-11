import React from "react";

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
  return (
    <input
      type={type}
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={style}
      className={className}
    />
  );
}

export default TextInput;
