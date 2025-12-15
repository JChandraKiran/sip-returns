export default function ChipSelect({ chips, selectedChip, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: "3px" }}>
      {chips.map((chip, index) => {
        const isSelected = selectedChip === chip;
        return (
          <>
            <div
              key={index}
              onClick={() => onChange(chip)}
              style={{
                border: isSelected
                  ? "2px solid #fa6400"
                  : "2px solid #fcac76ff",
                borderRadius: "5px",
                padding: "1px 10px",
                gap: "3px",
                cursor: "pointer",
                backgroundColor: isSelected ? "#fa6400" : "transparent",
                color: isSelected ? "white" : "#666",
                fontWeight: "400",
                fontSize: "14px",
              }}
            >
              {chip}
            </div>
          </>
        );
      })}
    </div>
  );
}
