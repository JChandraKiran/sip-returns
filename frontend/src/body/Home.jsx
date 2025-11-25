import axios from "axios";
import { useState, useEffect } from "react";
import Select from "../components/Select";
import TextInput from "../components/TextInput";
import DateInput from "../components/DateInput";
import Button from "../components/Button/Button";
import ChipSelect from "../components/ChipSelect/ChipSelect";
import InvestmentChart from "../components/InvestmentChart";
import InvestmentDonutChart from "../components/InvestmentDonutChart";
import {
  formatDate,
  getYesterday,
  getMonthsAgo,
  getYearsAgo,
  decimalFormat,
} from "../utils/helper";

// import DateRangeSlider from "../components/DateRangeSlider";
import DateRangeSlider from "../components/DateRangeSlider";
import SideHeading from "../components/Typography/SideHeading/SideHeading";
import Card from "../components/Card/Card";
import ResultHeading from "../components/Typography/ResultHeading/ResultHeading";

import ArrowDownIcon from "../components/Icons/ArrowDownIcon";
import ArrowUpIcon from "../components/Icons/ArrowUpIcon";

export default function Home() {
  const cryptocurrencyOptions = [
    { value: "btc", label: "Bitcoin" },
    { value: "eth", label: "Ethereum" },
    { value: "bnb", label: "BNB" },
    { value: "sol", label: "Solana" },
  ];
  const frequencyOptions = [
    { value: "hourly", label: "Hourly" },
    { value: "daily", label: "Daily" },
    { value: "10 days", label: "10 Days" },
    { value: "monthly", label: "Monthly" },
  ];

  const durationChips = ["last 6 months", "1 year", "2 years", "5 years"];

  const [cryptocurrency, setCryptocurrency] = useState(
    cryptocurrencyOptions[0].value
  );
  const [method, setMethod] = useState("dca");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(formatDate(getYesterday()));
  const [frequency, setFrequency] = useState(frequencyOptions[0].value);
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedChip, setSelectedChip] = useState(null);
  const [minDates, setMinDates] = useState(() => {
    const stored = localStorage.getItem("minDates");
    return stored ? JSON.parse(stored) : null;
  });

  const handleCryptocurrencyChange = (event) =>
    setCryptocurrency(event.target.value);
  const handleMethodChange = (newMethod) => setMethod(newMethod);
  const handleDCAClick = () => handleMethodChange("dca");
  const handleLumpsumClick = () => handleMethodChange("lumpsum");
  const handleFromDateChange = (event) => {
    setFromDate(event.target.value);
    setSelectedChip(null);
  };
  const handleToDateChange = (event) => {
    setToDate(event.target.value);
    setSelectedChip(null);
  };
  const handleFrequencyChange = (event) => setFrequency(event.target.value);
  const handleAmountChange = (event) => setAmount(event.target.value);
  const onChipChange = (selectedChip) => {
    setSelectedChip(selectedChip);
    setToDate(formatDate(getYesterday()));
    if (selectedChip === "last 6 months") {
      setFromDate(formatDate(getMonthsAgo(6)));
    } else if (selectedChip === "1 year") {
      setFromDate(formatDate(getYearsAgo(1)));
    } else if (selectedChip === "2 years") {
      setFromDate(formatDate(getYearsAgo(2)));
    } else if (selectedChip === "5 years") {
      setFromDate(formatDate(getYearsAgo(5)));
    }
  };

  // ✅ Updated handleSubmit
  const handleSubmit = async () => {
    setError(null);
    setResult(null);

    if (!cryptocurrency || !method || !fromDate || !frequency || !amount) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      // 🌐 Backend URL
      const backendURL = "/api/sip-returns";
      const response = await axios.post(backendURL, {
        cryptocurrency,
        method,
        fromDate,
        toDate,
        frequency,
        amount: parseFloat(amount),
      });
      console.log(response.data);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getMinDates = async () => {
      try {
        const backendURL = "/api/min-dates";
        const response = await axios.get(backendURL);
        console.log(response.data);
        setMinDates(response.data);
        localStorage.setItem("minDates", JSON.stringify(response.data));
      } catch (error) {
        console.error(error);
        setError(error.response?.data?.error || "Something went wrong");
      }
    };

    if (!minDates) {
      getMinDates();
    }
  }, []);

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
          flexDirection: "column",
          gap: "10px",
          alignItems: "flex-start",
          borderRadius: "15px",
          padding: "40px",
          width: "100%",
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

        <SideHeading text={"Cryptocurrency:"} />
        <Select
          id="Cryptocurrency"
          value={cryptocurrency}
          onChange={handleCryptocurrencyChange}
          options={cryptocurrencyOptions}
        />

        <SideHeading text={"Duration:"} />
        <div>From:</div>
        <DateInput
          id="from-date"
          value={fromDate}
          onChange={handleFromDateChange}
        />
        <div>To:</div>
        <DateInput id="to-date" value={toDate} onChange={handleToDateChange} />
        {minDates && minDates[cryptocurrency.toUpperCase()] && (
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "70%" }}>
              <DateRangeSlider
                minDate={minDates[cryptocurrency.toUpperCase()].split("T")[0]}
                maxDate={formatDate(getYesterday())}
                onChange={(f, t) => {
                  setFromDate(f);
                  setToDate(t);
                  setSelectedChip(null);
                }}
                fromDate={fromDate}
                toDate={toDate}
              />
            </div>
          </div>
        )}
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <ChipSelect
            chips={durationChips}
            selectedChip={selectedChip}
            onChange={onChipChange}
          />
        </div>

        <SideHeading text={"Frequency:"} />
        <Select
          id="frequency"
          value={frequency}
          onChange={handleFrequencyChange}
          options={frequencyOptions}
        />
        <SideHeading text={"Amount in $:"} />
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
      </Card>
      <div style={{ display: "flex", width: "100%", gap: "20px" }}>
        {result && (
          <>
            <Card style={{ width: "50%" }}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <ResultHeading
                    label={`Accumulated ${result.cryptocurrency.toUpperCase()}`}
                  />
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#555",
                    }}
                  >
                    {decimalFormat(result.totalUnits)}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <ResultHeading label="Average Price" />
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#555",
                    }}
                  >
                    ${decimalFormat(result.avgPrice)}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <ResultHeading label="No of investments" />
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#555",
                    }}
                  >
                    {result.dataPoints}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <ResultHeading label="Invested amount" />
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#5470c6",
                    }}
                  >
                    ${decimalFormat(result.investedValue)}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <ResultHeading label="Current Value" />
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#555",
                    }}
                  >
                    ${decimalFormat(result.currentValue)}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <ResultHeading label="Returns" />
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color:
                        result.currentValue - result.investedValue >= 0
                          ? "#4cab1fff"
                          : "#ee6666",
                    }}
                  >
                    {(
                      ((result.currentValue - result.investedValue) * 100) /
                      result.investedValue
                    ).toFixed(2)}
                    %
                    {result.currentValue - result.investedValue >= 0 ? (
                      <ArrowUpIcon />
                    ) : (
                      <ArrowDownIcon />
                    )}
                  </span>
                </div>
              </div>
            </Card>
            <Card style={{ width: "50%" }}>
              <InvestmentDonutChart
                investedValue={result.investedValue}
                currentValue={result.currentValue}
              />
            </Card>
          </>
        )}
      </div>
      <div style={{ width: "100%" }}>
        {result?.chartData && result.chartData.length > 0 && (
          <InvestmentChart
            chartData={result.chartData}
            cryptocurrency={result.cryptocurrency}
          />
        )}
      </div>
    </div>
  );
}
