import axiosInstance from "../api/axiosInstance";
import { useState, useEffect } from "react";
import Select from "../components/Select";
import Card from "../components/Card/Card";
import HeatmapTable from "../components/ReturnsHeatmap/HeatmapTable";
import { colors } from "../utils/colors";

export default function ReturnsCalendar() {
  const cryptocurrencyOptions = [
    { value: "btc", label: "Bitcoin" },
    { value: "eth", label: "Ethereum" },
    { value: "bnb", label: "BNB" },
    { value: "sol", label: "Solana" },
  ];

  const frequencyOptions = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "weekly", label: "Weekly" },
  ];

  const [cryptocurrency, setCryptocurrency] = useState(
    cryptocurrencyOptions[0].value
  );
  const [frequency, setFrequency] = useState(frequencyOptions[0].value);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleCryptocurrencyChange = (event) =>
    setCryptocurrency(event.target.value);
  const handleFrequencyChange = (event) => setFrequency(event.target.value);

  const fetchReturnsData = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await axiosInstance.get("/dwmqReturns", {
        params: { symbol: cryptocurrency },
      });
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnsData();
  }, [cryptocurrency]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        padding: "20px",
        backgroundColor: colors.bgPrimary,
        minHeight: "100vh",
      }}
    >
      {/* Page Title */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "12px",
          maxWidth: "800px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: colors.textPrimary,
            margin: "0 0 8px 0",
            lineHeight: "1.2",
          }}
        >
          Crypto Returns Calendar
        </h1>
        <p
          style={{
            fontSize: "16px",
            fontWeight: "400",
            color: colors.textSecondary,
            margin: "0",
            lineHeight: "1.5",
          }}
        >
          View historical returns in a heatmap format
        </p>
      </div>

      <Card
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          alignItems: "center",
          borderRadius: "15px",
          width: "100%",
          maxWidth: "600px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: colors.primary,
            }}
          >
            Cryptocurrency:
          </label>
          <Select
            id="cryptocurrency"
            value={cryptocurrency}
            onChange={handleCryptocurrencyChange}
            options={cryptocurrencyOptions}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: colors.primary,
            }}
          >
            View:
          </label>
          <Select
            id="frequency"
            value={frequency}
            onChange={handleFrequencyChange}
            options={frequencyOptions}
          />
        </div>
      </Card>

      {error && (
        <Card style={{ width: "100%", maxWidth: "1200px" }}>
          <p
            style={{
              color: colors.danger,
              backgroundColor: colors.dangerLight + "20",
              padding: "10px",
              borderRadius: "8px",
              textAlign: "center",
              margin: "0",
            }}
          >
            {error}
          </p>
        </Card>
      )}

      {loading && (
        <Card style={{ width: "100%", maxWidth: "1200px" }}>
          <p
            style={{
              textAlign: "center",
              color: colors.textSecondary,
              margin: "0",
              fontSize: "16px",
            }}
          >
            Loading returns data...
          </p>
        </Card>
      )}

      {data && !loading && (
        <Card style={{ width: "100%", maxWidth: "1200px", overflowX: "auto" }}>
          <HeatmapTable
            data={data[frequency]}
            frequency={frequency}
            symbol={cryptocurrency.toUpperCase()}
          />
        </Card>
      )}
    </div>
  );
}
