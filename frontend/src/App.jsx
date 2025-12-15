import "./App.css";
import { useState } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import Home from "./body/Home";
import ReturnsCalendar from "./body/ReturnsCalendar";
import Button from "./components/Button/Button";

function App() {
  const [activeTab, setActiveTab] = useState("calculator");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <Header />

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          padding: "10px 20px",
          background: "#f5f5f5",
        }}
      >
        <Button
          onClick={() => setActiveTab("calculator")}
          className="primary"
          style={{
            background: activeTab === "calculator" ? "#F9812D" : "#999",
            minWidth: "150px",
          }}
        >
          SIP Calculator
        </Button>
        <Button
          onClick={() => setActiveTab("returns")}
          className="primary"
          style={{
            background: activeTab === "returns" ? "#F9812D" : "#999",
            minWidth: "150px",
          }}
        >
          Returns Calendar
        </Button>
      </div>

      {/* Content */}
      {activeTab === "calculator" ? <Home /> : <ReturnsCalendar />}

      <Footer />
    </div>
  );
}

export default App;
