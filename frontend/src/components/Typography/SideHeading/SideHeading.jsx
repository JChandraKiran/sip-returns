import { colors } from "../../../utils/colors";

export default function SideHeading({ text, style = {} }) {
  const defaultStyle = {
    color: colors.primary,
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 8px 0",
    lineHeight: "1.4",
  };

  return <div style={{ ...defaultStyle, ...style }}>{text}</div>;
}
