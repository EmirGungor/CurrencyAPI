import "./App.css";
import BuyMeACoffee from "./components/BuyMeACofee";
import Currency from "./components/Currency";

function App() {
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Currency />
      </div>
      <div
        style={{
          position: "fixed", // Sayfada sabit bir konuma yerleştir
          bottom: "20px", // Sayfanın altından 20px yukarıda
          right: "20px", // Sayfanın sağından 20px içeride
          zIndex: 1, // Butonu diğer elemanların üzerinde göster
        }}
      >
        <BuyMeACoffee />
      </div>
    </>
  );
}

export default App;
