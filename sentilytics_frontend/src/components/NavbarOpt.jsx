import React, { useState, useEffect, useRef } from 'react';
import "../styles/navbaropt.css";
import Swal from 'sweetalert2';
import { Link, useNavigate } from "react-router-dom";

const NavbarOpt = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isNavVisible, setIsNavVisible] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setIsLoggedIn(localStorage.getItem("token"));

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
            Swal.fire({
                title: "Are you sure?",
                text: "Log Out!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes,Log Out!",
                cancelButtonText: "Cancel",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const token = localStorage.getItem("token");
                        const response = await fetch('http://127.0.0.1:8000/api/logout/', {
                            method: "POST",
                            headers: {
                                Authorization: `Token ${token}`,
                            },
                        });
    
                        if (response.ok) {
                            localStorage.removeItem("token");
                            localStorage.removeItem("username");
                            Swal.fire("Success!", "Logged out successfully!", "success").then(() => {
                                navigate("/");              
                                window.location.reload();
                            });
    
                        } else {
                            Swal.fire("Failed!", "Failed to Log Out.", "error");
                        }
                    } catch (error) {
                        Swal.fire("Error!", "Something went wrong.", "error");
                        console.error("Delete error:", error);
                    }
                }
            });
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
