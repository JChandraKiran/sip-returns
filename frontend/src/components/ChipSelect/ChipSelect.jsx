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
                border: "2px solid #fa6400",
                borderRadius: "15px",
                padding: "1px 10px",
                gap: "3px",
                cursor: "pointer",
                backgroundColor: isSelected ? "#fa6400" : "transparent",
                color: isSelected ? "white" : "black",
                fontWeight: "400",
                // fontSize: "14px",
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
