import "../styles/register.css";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                alert("Registered successfully!");
                navigate("/");
            } else {
                alert("Registration failed: " + data.error);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="register-container"
        >
            <div className="register-card">
                <h1 className="register-heading">Register</h1>
                <form onSubmit={handleSubmit} className="register-form">
                    <label>Name:</label>
                    <input type="text" name="name" className="register-input" value={formData.name} onChange={handleChange} required />

                    <label>Email:</label>
                    <input type="email" name="email" className="register-input" value={formData.email} onChange={handleChange} required />

                    <label>Password:</label>
                    <input type="password" name="password" className="register-input" value={formData.password} onChange={handleChange} required />

                    <label>Confirm Password:</label>
                    <input type="password" name="confirmPassword" className="register-input" value={formData.confirmPassword} onChange={handleChange} required />

                    <p>Already have an account? <Link to="/login" className="link">Log in</Link></p>
                    <input type="submit" value="Register" className="register-btn" />
                </form>
            </div>
        </motion.div>
    );
}

export default Register;
