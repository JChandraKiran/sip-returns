import axios from "axios";
import { useState } from "react";
import Select from "../components/Select";
import TextInput from "../components/TextInput";
import DateInput from "../components/DateInput";
import Button from "../components/Button/Button";

export default function Home() {
  const cryptocurrencyOptions = [
    { value: "btc", label: "Bitcoin" },
    { value: "eth", label: "Ethereum" },
    { value: "sol", label: "Solana" },
  ];
  const frequencyOptions = [
    { value: "hourly", label: "Hourly" },
    { value: "daily", label: "Daily" },
    { value: "tendays", label: "10 Days" },
    { value: "monthly", label: "Monthly" },
  ];

  const [cryptocurrency, setCryptocurrency] = useState(
    cryptocurrencyOptions[0].value
  );
  const [method, setMethod] = useState("dca");
  const [date, setDate] = useState("");
  const [frequency, setFrequency] = useState(frequencyOptions[0].value);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCryptocurrencyChange = (event) =>
    setCryptocurrency(event.target.value);
  const handleMethodChange = (newMethod) => setMethod(newMethod);
  const handleDCAClick = () => handleMethodChange("dca");
  const handleLumpsumClick = () => handleMethodChange("lumpsum");
  const handleDateChange = (event) => setDate(event.target.value);
  const handleFrequencyChange = (event) => setFrequency(event.target.value);
  const handleAmountChange = (event) => setAmount(event.target.value);

  // ✅ Updated handleSubmit
  const handleSubmit = async () => {
    setError(null);
    setResult(null);

    if (!cryptocurrency || !method || !date || !frequency || !amount) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      // 🌐 Backend URL
      const backendURL = "/api/sip-returns";
      // import.meta.env.VITE_BACKEND_URL + "/sip-returns" ||
      // "http://localhost:3000/api/sip-returns"; // local dev fallback
      // "https://sip-returns-backend-r5qzz2zrh-j-chandra-kirans-projects.vercel.app/api/sip-returns";

      const response = await axios.post(backendURL, {
        cryptocurrency,
        method,
        date,
        frequency,
        amount: parseFloat(amount),
      });

      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "flex-start",
        borderRadius: "15px",
        padding: "20px",
        boxShadow:
          "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
        width: "50%",
      }}
    >
      <div style={{ display: "flex", gap: "10px" }}>
        <Button
          onClick={handleDCAClick}
          className="primary"
          style={{ background: method !== "dca" && "gray" }}
        >
          DCA
        </Button>
        <Button
          onClick={handleLumpsumClick}
          className="primary"
          style={{ background: method !== "lumpsum" && "gray" }}
        >
          Lumpsum
        </Button>
      </div>

      <div>Cryptocurrency:</div>
      <Select
        id="Cryptocurrency"
        value={cryptocurrency}
        onChange={handleCryptocurrencyChange}
        options={cryptocurrencyOptions}
      />

      <div>Since:</div>
      <DateInput id="date-picker" value={date} onChange={handleDateChange} />

      <div>Frequency:</div>
      <Select
        id="frequency"
        value={frequency}
        onChange={handleFrequencyChange}
        options={frequencyOptions}
      />

      <div>Amount in $:</div>
      <TextInput
        type="number"
        value={amount}
        onChange={handleAmountChange}
        placeholder="Enter amount"
      />

      <div>
        <Button onClick={handleSubmit} className="primary" disabled={loading}>
          {loading ? "Calculating..." : "Calculate"}
        </Button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && (
        <>
          <div>
            Accumulated {result.cryptocurrency} : {result.totalUnits}\n
          </div>
          <div>Average Price : {result.avgPrice}</div>
          <div>No of investments : {result.dataPoints}</div>
          <div>Invested amount : ${result.investedValue}</div>
        </>
      )}
    </div>
  );
}
