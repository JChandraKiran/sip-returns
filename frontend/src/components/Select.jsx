import React from "react";

function Select({
  options = [],
  value,
  onChange,
  name,
  id,
  disabled,
  style,
  className,
}) {
  return (
    <select
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{ width: "auto", ...style }}
      className={className}
    >
      {options.map((opt, index) => (
        <option key={index} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
