export default function ResultHeading({ label, style = {} }) {
  return (
    <div
      style={{
        fontSize: "16px",
        fontWeight: "500",
        color: "#666",
        marginBottom: "8px",
        ...style,
      }}
    >
      {label}
    </div>
  );
}
