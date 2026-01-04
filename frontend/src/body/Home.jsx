import axiosInstance from "../api/axiosInstance";
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

import DateRangeSlider from "../components/DateRangeSlider/DateRangeSlider";
import SideHeading from "../components/Typography/SideHeading/SideHeading";
import Card from "../components/Card/Card";
import ResultHeading from "../components/Typography/ResultHeading/ResultHeading";

import ArrowDownIcon from "../components/Icons/ArrowDownIcon";
import ArrowUpIcon from "../components/Icons/ArrowUpIcon";
import { colors } from "../utils/colors";

export default function Home() {
  const cryptocurrencyOptions = [
    { value: "btc", label: "Bitcoin" },
    { value: "eth", label: "Ethereum" },
    { value: "bnb", label: "BNB" },
    { value: "sol", label: "Solana" },
  ];
  const frequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "hourly", label: "Hourly" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const dayOfWeekOptions = [
    { value: "sunday", label: "Sunday" },
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
  ];

  const durationChips = ["last 6 months", "1 year", "2 years", "5 years"];

  const [cryptocurrency, setCryptocurrency] = useState(
    cryptocurrencyOptions[0].value
  );
  const [method, setMethod] = useState("dca");
  const [fromDate, setFromDate] = useState(formatDate(getMonthsAgo(6)));
  const [toDate, setToDate] = useState(formatDate(getYesterday()));
  const [frequency, setFrequency] = useState(frequencyOptions[0].value);
  const [dayOfWeek, setDayOfWeek] = useState(dayOfWeekOptions[0].value);
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedChip, setSelectedChip] = useState("last 6 months");
  const [minDates, setMinDates] = useState(() => {
    const stored = localStorage.getItem("minDates");
    return stored ? JSON.parse(stored) : null;
  });

  // Helper function to get min date based on frequency
  const getMinDateForFrequency = (freq, crypto) => {
    if (!minDates || !minDates[crypto.toUpperCase()]) {
      return null;
    }

    const tokenMinDates = minDates[crypto.toUpperCase()];

    // For hourly frequency, use hourly min date
    if (freq === "hourly") {
      return tokenMinDates.hourly ? tokenMinDates.hourly.split("T")[0] : null;
    }

    // For other frequencies (daily, weekly, monthly), use daily min date
    return tokenMinDates.daily ? tokenMinDates.daily.split("T")[0] : null;
  };

  const handleCryptocurrencyChange = (event) => {
    const newCrypto = event.target.value;
    setCryptocurrency(newCrypto);

    // Adjust fromDate if it's before the minimum allowed date for the new cryptocurrency
    if (minDates && minDates[newCrypto.toUpperCase()]) {
      const minDate = getMinDateForFrequency(frequency, newCrypto);
      if (minDate && new Date(fromDate) < new Date(minDate)) {
        setFromDate(formatDate(new Date(minDate)));
        setSelectedChip(null);
      }
    }
  };
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
  const handleFrequencyChange = (event) => {
    const newFrequency = event.target.value;
    setFrequency(newFrequency);

    // Adjust fromDate if it's before the minimum allowed date for the new frequency
    if (minDates && minDates[cryptocurrency.toUpperCase()]) {
      const minDate = getMinDateForFrequency(newFrequency, cryptocurrency);
      if (minDate && new Date(fromDate) < new Date(minDate)) {
        setFromDate(formatDate(new Date(minDate)));
        setSelectedChip(null);
      }
    }
  };
  const handleDayOfWeekChange = (event) => setDayOfWeek(event.target.value);
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

  const handleSubmit = async () => {
    setError(null);
    // setResult(null);

    if (!cryptocurrency || !method || !fromDate || !frequency || !amount) {
      setError("Please fill in all fields.");
      return;
    }

    if (frequency === "weekly" && !dayOfWeek) {
      setError("Please select a day of the week for weekly investments.");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    if (new Date(fromDate) >= new Date(toDate)) {
      setError("From date must be before To date.");
      return;
    }
    setLoading(true);

    try {
      const params = {
        cryptocurrency,
        method,
        fromDate,
        toDate,
        frequency,
        amount: parseFloat(amount),
      };

      if (frequency === "weekly") {
        params.dayOfWeek = dayOfWeek;
      }

      const response = await axiosInstance.get("/sip-returns", { params });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   const getdwmq = async () => {
  //     try {
  //       const url = `api/dwmqReturns?token=${cryptocurrency}`;
  //       const response = await axios.get(url);
  //       console.log(response);
  //     } catch (error) {
  //       setError(error.response?.data?.error || "Something went wrong");
  //     }
  //   };
  //   getdwmq();
  // }, []);

  useEffect(() => {
    const getMinDates = async () => {
      try {
        const response = await axiosInstance.get("/min-dates");
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

  // Auto-calculate on initial page load
  useEffect(() => {
    // Only run on initial mount
    handleSubmit();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        padding: "20px 10px",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Main Content Container: Form on Left, Results on Right */}
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: "1200px",
          gap: "20px",
          alignItems: "flex-start",
          boxSizing: "border-box",
        }}
      >
        {/* Left Side - Form */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            alignItems: "flex-start",
            borderRadius: "15px",
            flex: "1",
            maxWidth: "calc(60% - 10px)",
            boxSizing: "border-box",
            margin: "20px",
          }}
        >
          {/* Method Selection Section */}
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                onClick={handleDCAClick}
                className="primary"
                style={{
                  background:
                    method === "dca" ? colors.primary : colors.bgWhite,
                  color:
                    method === "dca" ? colors.textLight : colors.textSecondary,
                  border: `2px solid ${
                    method === "dca" ? colors.primary : colors.gray300
                  }`,
                  fontWeight: method === "dca" ? "600" : "500",
                }}
              >
                DCA
              </Button>
              <Button
                onClick={handleLumpsumClick}
                className="primary"
                style={{
                  background:
                    method === "lumpsum" ? colors.primary : colors.bgWhite,
                  color:
                    method === "lumpsum"
                      ? colors.textLight
                      : colors.textSecondary,
                  border: `2px solid ${
                    method === "lumpsum" ? colors.primary : colors.gray300
                  }`,
                  fontWeight: method === "lumpsum" ? "600" : "500",
                }}
              >
                Lumpsum
              </Button>
            </div>
          </div>

          {/* Cryptocurrency Section */}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <SideHeading
              text={"Cryptocurrency:"}
              style={{ textAlign: "left" }}
            />
            <Select
              id="Cryptocurrency"
              value={cryptocurrency}
              onChange={handleCryptocurrencyChange}
              options={cryptocurrencyOptions}
            />
          </div>

          {/* Duration Section */}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <SideHeading text={"Duration:"} style={{ textAlign: "left" }} />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "12px",
                width: "100%",
              }}
            >
              <div
                style={{
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    color: colors.textSecondary,
                    textAlign: "left",
                  }}
                >
                  From:
                </div>
                <DateInput
                  id="from-date"
                  value={fromDate}
                  onChange={handleFromDateChange}
                  min={getMinDateForFrequency(frequency, cryptocurrency)}
                  max={formatDate(getYesterday())}
                />
              </div>
              <div
                style={{
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    color: colors.textSecondary,
                    textAlign: "left",
                  }}
                >
                  To:
                </div>
                <DateInput
                  id="to-date"
                  value={toDate}
                  onChange={handleToDateChange}
                  min={getMinDateForFrequency(frequency, cryptocurrency)}
                  max={formatDate(getYesterday())}
                />
              </div>
            </div>
          </div>
          {/* Date Range Slider */}
          {minDates && minDates[cryptocurrency.toUpperCase()] && (
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                marginTop: "8px",
              }}
            >
              <div style={{ width: "70%" }}>
                <DateRangeSlider
                  minDate={getMinDateForFrequency(frequency, cryptocurrency)}
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

          {/* Duration Chips */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: "-8px",
            }}
          >
            <ChipSelect
              chips={durationChips}
              selectedChip={selectedChip}
              onChange={onChipChange}
            />
          </div>

          {/* Frequency Section */}
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "flex-start",
              gap: "80px",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <SideHeading text={"Frequency:"} style={{ textAlign: "left" }} />
              <Select
                id="frequency"
                value={frequency}
                onChange={handleFrequencyChange}
                options={frequencyOptions}
                style={{ width: "100%" }}
              />
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              {frequency === "weekly" && (
                <>
                  <SideHeading
                    text={"Day of Week:"}
                    style={{ textAlign: "left" }}
                  />
                  <Select
                    id="dayOfWeek"
                    value={dayOfWeek}
                    onChange={handleDayOfWeekChange}
                    options={dayOfWeekOptions}
                    style={{ width: "100%" }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Day of Week Section (conditional) */}

          {/* Amount Section */}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <SideHeading text={"Amount in $:"} style={{ textAlign: "left" }} />
            <TextInput
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              aria-label="Investment amount in dollars"
            />
          </div>

          {/* Calculate Button */}
          <div style={{ width: "100%", marginTop: "8px" }}>
            <Button
              onClick={handleSubmit}
              className="primary"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Calculating..." : "Calculate"}
            </Button>
          </div>

          {error && (
            <p
              style={{
                color: colors.danger,
                backgroundColor: colors.dangerLight + "20",
                padding: "10px",
                borderRadius: "8px",
                margin: "10px 0 0 0",
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* Right Side - Results and Donut (Stacked Vertically) */}
        <div
          style={{
            flex: "1",
            maxWidth: "calc(40% - 10px)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            boxSizing: "border-box",
          }}
        >
          {/* Results Card */}
          <Card style={{ width: "100%", boxSizing: "border-box" }}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "3px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <ResultHeading label="No of investments" />
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: colors.textSecondary,
                  }}
                >
                  {loading ? "..." : result?.noOfInvestments || "-"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <ResultHeading label="Total Invested" />
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: colors.info,
                  }}
                >
                  {loading
                    ? "..."
                    : result
                    ? `$${decimalFormat(result.totalInvested)}`
                    : "-"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <ResultHeading
                  label={`Accumulated ${
                    result?.cryptocurrency?.toUpperCase() || "Crypto"
                  }`}
                />
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: colors.textSecondary,
                  }}
                >
                  {loading
                    ? "..."
                    : result
                    ? decimalFormat(result.accumulatedUnits)
                    : "-"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <ResultHeading label="Average Price" />
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: colors.textSecondary,
                  }}
                >
                  {loading
                    ? "..."
                    : result
                    ? `$${decimalFormat(result.averagePrice)}`
                    : "-"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <ResultHeading label="Last Traded Price" />
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: colors.primary,
                  }}
                >
                  {loading
                    ? "..."
                    : result
                    ? `$${decimalFormat(result.todayPrice)}`
                    : "-"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <ResultHeading label="Current Value" />
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  {loading
                    ? "..."
                    : result
                    ? `$${decimalFormat(result.ValueOfAccumulatedUnits)}`
                    : "-"}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  // backgroundColor: colors.primarySubtle,
                  padding: "14px 16px",
                  borderRadius: "8px",
                  marginTop: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: colors.textPrimary,
                  }}
                >
                  Returns
                </div>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: loading
                      ? colors.textSecondary
                      : result
                      ? result.ValueOfAccumulatedUnits - result.totalInvested >=
                        0
                        ? colors.success
                        : colors.danger
                      : colors.textSecondary,
                  }}
                >
                  {loading ? (
                    "..."
                  ) : result ? (
                    <>
                      {(
                        ((result.ValueOfAccumulatedUnits -
                          result.totalInvested) *
                          100) /
                        result.totalInvested
                      ).toFixed(2)}
                      %
                      {result.ValueOfAccumulatedUnits - result.totalInvested >=
                      0 ? (
                        <ArrowUpIcon />
                      ) : (
                        <ArrowDownIcon />
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </span>
              </div>
            </div>
          </Card>

          {/* Donut Chart Card */}
          <Card style={{ width: "100%", boxSizing: "border-box" }}>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "350px",
                  color: colors.textSecondary,
                  fontSize: "16px",
                }}
              >
                Loading chart...
              </div>
            ) : result ? (
              <InvestmentDonutChart
                investedValue={result.totalInvested}
                currentValue={result.ValueOfAccumulatedUnits}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "350px",
                  color: colors.textSecondary,
                  fontSize: "16px",
                }}
              >
                No data available
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Line Chart - Full Width Below */}
      {result && result.chartData && result.chartData.length > 0 && (
        <div style={{ width: "100%", maxWidth: "1200px" }}>
          <InvestmentChart
            chartData={result.chartData}
            cryptocurrency={result.cryptocurrency}
          />
        </div>
      )}
    </div>
  );
}
