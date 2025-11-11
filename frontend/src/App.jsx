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
        alignItems: "center",
        justifyContent: "space-evenly",
        height: "100vh",
        width: "90vw",
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
