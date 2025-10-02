import "./App.css";
import BuyMeACoffee from "./components/BuyMeACofee";
import Currency from "./components/Currency";

function App() {
  return (
    <>
      <Currency />
      <div className="bmc-floating">
        <BuyMeACoffee />
      </div>
    </>
  );
}

export default App;
