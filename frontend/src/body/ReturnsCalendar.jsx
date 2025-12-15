import axios from "axios";
import { useState, useEffect } from "react";
import Select from "../components/Select";
import Card from "../components/Card/Card";
import HeatmapTable from "../components/ReturnsHeatmap/HeatmapTable";
import Button from "../components/Button/Button";

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
      const backendURL = "/api/dwmqReturns";
      const response = await axios.get(backendURL, {
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
      }}
    >
      <Card
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          alignItems: "center",
          borderRadius: "15px",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: "14px", fontWeight: "600" }}>
            Cryptocurrency:
          </label>
          <Select
            id="cryptocurrency"
            value={cryptocurrency}
            onChange={handleCryptocurrencyChange}
            options={cryptocurrencyOptions}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: "14px", fontWeight: "600" }}>
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
        <Card style={{ width: "100%" }}>
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        </Card>
      )}

      {loading && (
        <Card style={{ width: "100%" }}>
          <p style={{ textAlign: "center" }}>Loading returns data...</p>
        </Card>
      )}

      {data && !loading && (
        <Card style={{ width: "100%", overflowX: "auto" }}>
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
