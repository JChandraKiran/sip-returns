export default function SideHeading({ text, style = {} }) {
  const defaultStyle = {
    color: "#F9812D",
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 12px 0",
    lineHeight: "1.4",
  };

  return <div style={{ ...defaultStyle, ...style }}>{text}</div>;
}
