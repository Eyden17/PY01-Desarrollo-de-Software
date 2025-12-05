import React from "react";
import "../css/CreditCard.css";

import GoldCard from "../img/gold_card.png";
import PlatinumCard from "../img/plat_card.png";
import BlackCard from "../img/black_card.png";

const CreditCard = ({ type, number, exp, holder, vendor }) => {
  const numberGroups = String(number).trim().split(/\s+/);

  const maskedGroups = numberGroups.map((grp, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === numberGroups.length - 1;

    if (isFirst || isLast) {
      return grp;
    }

    return "•".repeat(grp.length);
  });

  const cardBackground = {
    Gold: GoldCard,
    Platinum: PlatinumCard,
    Black: BlackCard,
  }[type] || GoldCard;

  return (
    <div
      className="card"
      style={{
        backgroundImage: `url(${cardBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="card-info">
        <div className="card-logo">{vendor}</div>

        <div className="card-chip">
          <svg
            className="card-chip-lines"
            role="img"
            width="20px"
            height="20px"
            viewBox="0 0 100 100"
            aria-label="Chip"
          >
            <g opacity="0.8">
              <polyline points="0,50 35,50" fill="none" stroke="#000" strokeWidth="2" />
              <polyline points="0,20 20,20 35,35" fill="none" stroke="#000" strokeWidth="2" />
              <polyline points="50,0 50,35" fill="none" stroke="#000" strokeWidth="2" />
              <polyline points="65,35 80,20 100,20" fill="none" stroke="#000" strokeWidth="2" />
              <polyline points="100,50 65,50" fill="none" stroke="#000" strokeWidth="2" />
              <polyline points="35,35 65,35 65,65 35,65 35,35" fill="none" stroke="#000" strokeWidth="2" />
              <polyline points="0,80 20,80 35,65" fill="none" stroke="#000" strokeWidth="2" />
              <polyline points="50,100 50,65" fill="none" stroke="#000" strokeWidth="2" />
              <polyline points="65,65 80,80 100,80" fill="none" stroke="#000" strokeWidth="2" />
            </g>
          </svg>
          <div className="card-chip-texture"></div>
        </div>

        <div className="card-type">{type}</div>

        <div className="card-number" aria-hidden="true">
          {maskedGroups.map((group, index) => (
            <span key={index} className="card-digit-group">
              {group}
            </span>
          ))}
        </div>

        <div className="card-valid-thru" aria-label="Valid thru">
          Valid<br />thru
        </div>
        <div className="card-exp-date">
          <time dateTime={`20${exp.split("/")[1]}-${exp.split("/")[0]}`}>{exp}</time>
        </div>

        <div className="card-name" aria-label={holder}>
          {holder.toUpperCase()}
        </div>

        <div className="card-vendor" role="img" aria-labelledby="card-vendor">
          <span id="card-vendor" className="card-vendor-sr">{vendor}</span>
        </div>

        <div className="card-texture"></div>
      </div>
    </div>
  );
};

export default CreditCard;
