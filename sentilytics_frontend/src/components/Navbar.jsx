import React, { useState, useEffect, useRef } from 'react';
import "../styles/navbar.css";
import { Link, useNavigate } from "react-router-dom";

const NavbarOpt = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isNavVisible, setIsNavVisible] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("token"));

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        // alert("Logged out successfully!");
        navigate("/login");
        window.location.reload();
    };

    return (
        <header className="header">
            <Link to="/" className='logo'>
                <img src="/images/logo1.svg" alt="logo" />
            </Link>
            <button className="nav-toggle" onClick={() => setIsNavVisible(!isNavVisible)}>
                {isNavVisible ? '✖' : '☰'}
            </button>

            <nav className={`navigation ${isNavVisible ? 'visible' : ''}`}>
                <div className="nav-buttons">
                    <Link className='nav-btn' to="/single_comment">
                        <span className="btn-top">
                            <i className="bi bi-chat"></i> Single Comments
                        </span>
                    </Link>
                    <Link className='nav-btn' to="/multi_comment">
                        <span className="btn-top">
                            <i className="bi bi-file-earmark"></i> File Comments
                        </span>
                    </Link>
                    <Link className='nav-btn' to="/youtube_comment">
                        <span className="btn-top">
                            <i className="bi bi-youtube"></i> YouTube Comments
                        </span>
                    </Link>
                </div>

                {isLoggedIn ? (
                    <div className="home-profile" onClick={() => setIsDropdownVisible(!isDropdownVisible)} ref={dropdownRef}>
                        <i className="bi bi-person-fill"></i>
                        {isDropdownVisible && (
                            <div className="dropdown-menu">
                                <p className="dropdown-item username">{localStorage.getItem("username")}</p>
                                <Link to="/dashboard/stats" className="dropdown-item clickable">Dashboard</Link>
                                <button className="dropdown-item clickable" onClick={handleLogout}>Log out</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link className='nav-btn' to="/login">
                            <span className="btn-top">Log In</span>
                        </Link>
                        <Link className='nav-btn' to="/register">
                            <span className="btn-top">Register</span>
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default NavbarOpt;
