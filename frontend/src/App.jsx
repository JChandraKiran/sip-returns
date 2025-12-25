import "./App.css";
import { useState } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import Home from "./body/Home";
import ReturnsCalendar from "./body/ReturnsCalendar";

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
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content */}
      {activeTab === "calculator" ? <Home /> : <ReturnsCalendar />}

      <Footer />
    </div>
  );
}

export default App;
