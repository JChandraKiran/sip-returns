import { colors } from "../../../utils/colors";

export default function ResultHeading({ label, style = {} }) {
  return (
    <div
      style={{
        fontSize: "16px",
        fontWeight: "500",
        color: colors.textSecondary,
        marginBottom: "8px",
        ...style,
      }}
    >
      {label}
    </div>
  );
}
