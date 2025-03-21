import React from 'react';
import "../styles/homeopt.css"
const Features = ({ features }) => {
  return (
    <div className="home-features">
      <h1 className="features-title">See how Sentilytics can help</h1>
      {features.map((feature, index) => (
        <div key={feature.id} className="box">
          <div className="box-text">
            <p>{feature.title}</p>
            <h1>{feature.subtitle}</h1>
            <p>{feature.description}</p>
          </div>
          <img src={feature.image} alt={feature.title} className="box-img" />
        </div>
      ))}
    </div>
  );
};

export default Features;
