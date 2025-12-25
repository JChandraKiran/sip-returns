import { colors } from "../../utils/colors";

export default function ChipSelect({ chips, selectedChip, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: "8px" }}>
      {chips.map((chip, index) => {
        const isSelected = selectedChip === chip;
        return (
          <div
            key={index}
            onClick={() => onChange(chip)}
            style={{
              border: `2px solid ${
                isSelected ? colors.primary : colors.gray300
              }`,
              borderRadius: "8px",
              padding: "3px 8px",
              cursor: "pointer",
              backgroundColor: isSelected ? colors.primary : colors.bgWhite,
              color: isSelected ? colors.textLight : colors.textSecondary,
              fontWeight: isSelected ? "600" : "500",
              fontSize: "14px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.target.style.borderColor = colors.primaryLight;
                e.target.style.backgroundColor = colors.primarySubtle;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.target.style.borderColor = colors.gray300;
                e.target.style.backgroundColor = colors.bgWhite;
              }
            }}
          >
            {chip}
          </div>
        );
      })}
    </div>
  );
}
