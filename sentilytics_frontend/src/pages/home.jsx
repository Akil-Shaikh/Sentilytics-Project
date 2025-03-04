import "../styles/home.css"
import featuresinfo from "../api/featuresinfo.json"
import Features from "../components/Features";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Home() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
            const storedUser = JSON.parse(localStorage.getItem("user"));
            setUserData(storedUser);
        }
    }, []);
    const handleLogout = () => {
        localStorage.removeItem("token"); // Remove token
        alert("Logged out successfully!");
        navigate("/login")
        window.location.reload(); // Optional: Refresh page after logout
    };

    return (
        <>
            <div className="home-header">
                <nav className="navbar">

                    {isLoggedIn ? (
                        <div className="user-info">
                            <span className="home-profile">
                                <Link to="/dashboard">
                                    <i class="bi bi-person-fill"></i>
                                </Link>
                            </span>
                            <button className="nav-log" onClick={handleLogout}>Log out</button>
                        </div>
                    ) : (
                        <>
                            <Link className="nav-btn" to="/login">Login</Link>
                            <Link className="nav-btn" to="/login">Register</Link>
                        </>
                    )}
                </nav>
                <h2>Analyze Comments, Get Insights</h2>
                <p>Sentiment tracking, emotion detection, and insights into user feedback.</p>
                <div className="header-buttons">
                    <Link to="/use_sentilytics" className="cta-button">Use Sentilytics</Link>
                    <a href="#try" className="cta-button">Try Features</a>
                </div>
            </div>
            <div className="home-features">
                {featuresinfo.map((curElem) => {
                    return (
                        <Features key={curElem.id} curElem={curElem} />
                    )
                })}
            </div>
            <Link to="/dashboard" className="link">Dashboard</Link>

            {/* <div className="analyze">

                <Link to="/multi_comment" className="link">Analyze Sentiment</Link>
                <Link to="/youtube_comment" className="link">Youtube Sentiment</Link>
            </div> */}

        </>
    )
}

export default Home;