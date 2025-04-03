import "../styles/homeopt.css";
import Features from "../components/Features";
import Developers from "../components/Developers";
import featuresData from "../api/featuresinfo.json";

function Homeopt() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-text">
          <h1>Analyze comments at scale based on quality.</h1>
          <p>Our AI-driven algorithm automatically examines descriptive comments at scale, including sentiment and topic insights.</p>
        </div>
        <div className="image-placeholder"><img src="/images/home.jpg" alt="" /></div>
      </div>
      {/* Pass the featuresData to the Features component */}
      <Features features={featuresData} />
      <Developers />
    </div>
  );
}

export default Homeopt;
