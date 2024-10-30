/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "../css/currency.css";
import { FaLongArrowAltRight } from "react-icons/fa";

const Currency = () => {
  const [amount, setAmount] = useState();
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [result, setResult] = useState();

  const exchange = () => {
    console.log(amount);
    console.log(fromCurrency);
    console.log(toCurrency);
  };

  return (
    <>
      <div className="currency-div">
        <div>
          <h3
            style={{
              marginTop: "-20px",
              fontFamily: "cursive",
              color: "#fff",
              background: "black",
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
            onChange={(e) => setFromCurrency(e.target.value)}
            className="from-currency-option opt"
          >
            <option>ZLT</option>
          </select>

          <FaLongArrowAltRight
            style={{
              fontSize: "25px",
              color: "yellow",
              marginRight: "10px",
              marginTop: "10px",
            }}
          />

          <select
            onChange={(e) => setToCurrency(e.target.value)}
            className="to-currency-option opt"
          >
            <option>TL</option>
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
