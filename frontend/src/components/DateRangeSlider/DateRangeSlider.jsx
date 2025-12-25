import React, { useState, useEffect } from "react";
import RangeSliderInput from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import "./DateRangeSlider.css";

export default function DateRangeSlider({
  minDate,
  maxDate,
  onChange,
  fromDate,
  toDate,
}) {
  const start = new Date(minDate + "T00:00:00");
  const end = new Date(maxDate + "T00:00:00");
  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));

  const dateToIndex = (dateStr) => {
    if (!dateStr) return 0;
    const date = new Date(dateStr + "T00:00:00");
    const diff = Math.floor((date - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(diff, diffDays));
  };

  const indexToDate = (index) => {
    const d = new Date(start);
    d.setDate(d.getDate() + index);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Calculate range from parent's fromDate and toDate
  const fromIndex = dateToIndex(fromDate);
  const toIndex = dateToIndex(toDate);
  const [range, setRange] = useState([fromIndex, toIndex]);

  // Sync slider with parent date changes
  useEffect(() => {
    setRange([fromIndex, toIndex]);
  }, [fromDate, toDate, fromIndex, toIndex]);

  const handleSliderChange = (vals) => {
    let [from, to] = vals;

    // ❗ Prevent crossing
    if (from > to) {
      if (vals === range) return;

      // Choose a rule:
      // Rule: If left thumb crosses, lock it to right thumb
      from = to;
    }

    setRange([from, to]);
    onChange(indexToDate(from), indexToDate(to));
  };

  return (
    <div style={{ width: "100%", padding: "20px 0" }}>
      <RangeSliderInput
        min={0}
        max={diffDays}
        step={1}
        value={range}
        onInput={handleSliderChange}
        className="date-range-slider"
      />
    </div>
  );
}
