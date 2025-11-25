import React from "react";

function DateInput({
  value,
  onChange,
  name,
  id,
  min,
  max,
  disabled,
  style,
  className = "DateInput",
}) {
  return (
    <input
      type="date"
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      disabled={disabled}
      style={style}
      className={className}
    />
  );
}

export default DateInput;
