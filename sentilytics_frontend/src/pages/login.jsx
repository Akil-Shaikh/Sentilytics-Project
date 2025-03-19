import { motion } from "framer-motion"
import "../styles/login.css"
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
function Login() {


    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/"); // Redirect to login page if token is missing
        }
    }, [navigate]);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://127.0.0.1:8000/api/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username, // Django requires "username", not "email"
                    password: formData.password,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("username", formData.username);
                localStorage.setItem("token", data.token); // Store token for authentication
                alert("Login successful!");
                navigate("/");
            } else {
                alert("Login failed: " + (data.error || "Invalid credentials"));
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (


        <motion.div className="login-container"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}>
            <div className="login-card">
                <h1 className="login-heading">Login</h1>
                <form action="#" className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="">Username : </label>
                    <input type="text" name="username" className="login-input" value={formData.username} onChange={handleChange} />
                    <label htmlFor="">Password : </label>
                    <input type="password" name="password" className="login-input" value={formData.password} onChange={handleChange} />
                    <p>Need Account? <Link to="/register" className="link">Create an account</Link></p>
                    <input type="submit" value="Submit" className="login-btn" />
                </form>
            </div>
        </motion.div>
    )
}

export default Login;