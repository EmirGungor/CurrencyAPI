/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "../css/currency.css";
import { FaLongArrowAltRight } from "react-icons/fa";
import { FaExchangeAlt } from "react-icons/fa";

import axios from "axios";

let BASE_URL = "https://api.freecurrencyapi.com/v1/latest";
let API_KEY = "fca_live_eG1QfuVZDcMeBxhjgW7BaqPU3ieBFBAuhtWPASII";

const Currency = () => {
  const [amount, setAmount] = useState(0);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("TRY");
  const [result, setResult] = useState(0);

  const exchange = async () => {
    const response = await axios.get(
      `${BASE_URL}?apikey=${API_KEY}&base_currency=${fromCurrency}`
    );
    setResult((response.data.data[toCurrency] * amount).toFixed(2));
  };

  const change = () => {
    let temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <>
      <div className="currency-div">
        <div>
          <h3
            style={{
              marginTop: "-20px",
              fontFamily: "cursive",
              fontWeight: "bold",
              padding: "10px",
            }}
          >
            Crental Currency
          </h3>
        </div>

        <div>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            className="value"
          />
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="from-currency-option opt"
          >
            <option>PLN</option>
            <option>TRY</option>
            <option>USD</option>
            <option>EUR</option>
          </select>

          <button onClick={change} className="changeBtn">
            <FaExchangeAlt />
          </button>

          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="to-currency-option opt"
          >
            <option>TRY</option>
            <option>PLN</option>
            <option>USD</option>
            <option>EUR</option>
          </select>

          <input
            value={result}
            onChange={(e) => setResult(e.target.value)}
            type="number"
            className="value"
          />
        </div>

        <button
          onClick={exchange}
          className="btn"
          style={{ marginTop: "20px" }}
        >
          Convert
        </button>
      </div>
    </>
  );
};

export default Currency;
