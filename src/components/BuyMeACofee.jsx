/* eslint-disable no-unused-vars */
import React from "react";

const BuyMeACoffee = () => {
  return (
    <div>
      <a
        href="https://www.buymeacoffee.com/emirgungor"
        target="_blank"
        rel="noopener noreferrer" // Güvenlik açısından eklendi
      >
        <img
          src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
          alt="Buy Me A Coffee"
          style={{
            height: "60px", // !important CSS içinde kullanılır, inline style'da doğrudan tanımlanır
            width: "217px",
          }}
        />
      </a>
    </div>
  );
};

export default BuyMeACoffee;