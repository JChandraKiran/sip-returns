import "./App.css";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import Home from "./body/Home";
function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <Header />
      <Home />
      <Footer />
    </div>
  );
}

export default App;
