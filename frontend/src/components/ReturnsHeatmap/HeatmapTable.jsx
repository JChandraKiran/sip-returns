import "./HeatmapTable.css";

export default function HeatmapTable({ data, frequency, symbol }) {
  if (!data || Object.keys(data).length === 0) {
    return <p>No data available</p>;
  }

  // Get color based on return value
  const getColor = (value) => {
    if (value === null || value === undefined) return "#f0f0f0";

    const absValue = Math.abs(value);
    let intensity;

    if (absValue >= 50) intensity = 900;
    else if (absValue >= 30) intensity = 700;
    else if (absValue >= 15) intensity = 500;
    else if (absValue >= 5) intensity = 300;
    else intensity = 100;

    if (value > 0) {
      // Green shades for positive
      const greens = {
        100: "#d4edda",
        300: "#a3d9a5",
        500: "#6ec570",
        700: "#4caf50",
        900: "#2e7d32",
      };
      return greens[intensity];
    } else if (value < 0) {
      // Red shades for negative
      const reds = {
        100: "#f8d7da",
        300: "#f5b7b1",
        500: "#e57373",
        700: "#e53935",
        900: "#c62828",
      };
      return reds[intensity];
    }
    return "#ffffff";
  };

  const getTextColor = (value) => {
    if (!value) return "#666";
    const absValue = Math.abs(value);
    return absValue >= 15 ? "#ffffff" : "#000000";
  };

  const years = Object.keys(data).sort();
  let columns = [];

  if (frequency === "monthly") {
    columns = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
  } else if (frequency === "quarterly") {
    columns = ["Q1", "Q2", "Q3", "Q4"];
  } else if (frequency === "weekly") {
    // Get max week number across all years
    const maxWeek = Math.max(
      ...years.map((year) =>
        Math.max(
          ...Object.keys(data[year]).map((w) => parseInt(w.substring(1)))
        )
      )
    );
    columns = Array.from({ length: maxWeek }, (_, i) => `W${i + 1}`);
  }

  return (
    <div className="heatmap-container">
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        {symbol} {frequency.charAt(0).toUpperCase() + frequency.slice(1)}{" "}
        Returns (%)
      </h2>

      <div className="heatmap-scroll">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th className="year-header">Year</th>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((year) => (
              <tr key={year}>
                <td className="year-cell">{year}</td>
                {columns.map((col) => {
                  const value = data[year]?.[col];
                  return (
                    <td
                      key={col}
                      className="return-cell"
                      style={{
                        backgroundColor: getColor(value),
                        color: getTextColor(value),
                      }}
                      title={
                        value
                          ? `${col} ${year}: ${value > 0 ? "+" : ""}${value}%`
                          : "No data"
                      }
                    >
                      {value !== undefined && value !== null
                        ? `${value > 0 ? "+" : ""}${value}%`
                        : "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
