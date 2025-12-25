import { colors } from "../utils/colors";

export default function Header({ activeTab, setActiveTab }) {
  return (
    <div
      style={{
        backgroundColor: colors.bgWhite,
        borderBottom: `2px solid ${colors.primary}`,
        padding: "16px 20px 12px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-end",
          gap: "30px",
        }}
      >
        {/* Heading */}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: colors.primary,
            margin: "0",
            lineHeight: "1.1",
            letterSpacing: "-0.5px",
            fontFamily: "Inter, sans-serif",
            transform: "skewX(-8deg)",
            display: "inline-block",
          }}
        >
          Proof of Returns
        </h1>

        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            gap: "15px",
          }}
        >
          <div
            onClick={() => setActiveTab("calculator")}
            style={{
              fontSize: "16px",
              fontWeight: activeTab === "calculator" ? "600" : "500",
              color:
                activeTab === "calculator"
                  ? colors.primary
                  : colors.textSecondary,
              cursor: "pointer",
              paddingBottom: "4px",
              transition: "all 0.2s ease",
            }}
          >
            SIP Calculator
          </div>
          <div
            onClick={() => setActiveTab("returns")}
            style={{
              fontSize: "16px",
              fontWeight: activeTab === "returns" ? "600" : "500",
              color:
                activeTab === "returns" ? colors.primary : colors.textSecondary,
              cursor: "pointer",
              paddingBottom: "4px",
              transition: "all 0.2s ease",
            }}
          >
            Returns Calendar
          </div>
        </div>
      </div>
    </div>
  );
}
