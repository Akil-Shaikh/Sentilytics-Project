import "../styles/home.css"
import Features from "../components/Features";
import featuresData from "../api/featuresinfo.json";


function Home() {


    return (
        <>
            <div class="home-container">
                <div class="hero-section">
                    <div className="hero-text">
                        <h1>Analyze comments at scale based on quality.</h1>
                        <p>Our AI-driven algorithm automatically examines descriptive comments at scale, including sentiment and topic insights.</p>
                    </div>
                    <div class="image-placeholder">Image</div>
                </div>
                <div className="home-features">
                    <h1 className="features-title">See how Sentilytics can help</h1>
                    <div className="box">
                        <div className="box-text">
                            <p>Sentiment Analysis</p>
                            <h1>Understand emotions in every comment</h1>
                            <p>Our advanced tool detects positive, negative, and neutral sentiments, helping you gauge audience opinions with ease.</p>
                        </div>
                        <img src="/images/img1.jpg" alt="Feature 1" className="box-img" />
                    </div>
                    <div className="box">
                        <div className="box-text">
                            <p> Bar Chart Visualization</p>
                            <h1>Clear insights through dynamic charts</h1>
                            <p>Get a visual breakdown of sentiment analysis with easy-to-read bar charts, making data interpretation simple and effective.</p>
                        </div>
                        <img src="/images/img2.jpg" alt="Feature 2" className="box-img" />
                    </div>
                    <div className="box">
                        <div className="box-text">
                            <p>Word Cloud Representation</p>
                            <h1>Spot key trends at a glance</h1>
                            <p>Discover the most frequently used words in feedback with an interactive word cloud, highlighting important topics instantly.</p>
                        </div>
                        <img src="/images/img3.jpg" alt="Feature 3" className="box-img" />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home;