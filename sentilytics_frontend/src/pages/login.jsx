import { motion } from "framer-motion"
import "../styles/login.css"
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    
    const [errors, setErrors] = useState({
        username: "",
        password: "",
        general: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/"); // Redirect to home page if token exists
        }
    }, [navigate]);

    const validateUsername = (username) => {
        if (!username.trim()) {
            return "Username is required";
        }
        return "";
    };

    const validatePassword = (password) => {
        if (!password) {
            return "Password is required";
        }
        return "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Clear general error when user starts typing
        if (errors.general) {
            setErrors(prev => ({ ...prev, general: "" }));
        }
        
        // Validate field on change
        let error = "";
        switch (name) {
            case "username":
                error = validateUsername(value);
                break;
            case "password":
                error = validatePassword(value);
                break;
            default:
                break;
        }
        
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const validateForm = () => {
        const usernameError = validateUsername(formData.username);
        const passwordError = validatePassword(formData.password);
        
        setErrors(prev => ({
            ...prev,
            username: usernameError,
            password: passwordError
        }));
        
        return !(usernameError || passwordError);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("username", formData.username);
                localStorage.setItem("token", data.token);
                navigate("/");
            } else {
                // Handle API authentication errors
                const errorMessage = data.error || "Invalid username or password";
                setErrors(prev => ({ ...prev, general: errorMessage }));
            }
        } catch (error) {
            console.error("Error:", error);
            setErrors(prev => ({ 
                ...prev, 
                general: "Connection error. Please check your internet connection and try again." 
            }));
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
                
                {errors.general && (
                    <div className="error-banner">
                        {errors.general}
                    </div>
                )}
                
                <form action="#" className="login-form" onSubmit={handleSubmit}>
                    <label>Username:</label>
                    <input 
                        type="text" 
                        name="username" 
                        className={`login-input ${errors.username ? 'error-input' : ''}`}
                        value={formData.username} 
                        onChange={handleChange} 
                    />
                    {errors.username && <div className="error-message">{errors.username}</div>}
                    
                    <label>Password:</label>
                    <input 
                        type="password" 
                        name="password" 
                        className={`login-input ${errors.password ? 'error-input' : ''}`}
                        value={formData.password} 
                        onChange={handleChange} 
                    />
                    {errors.password && <div className="error-message">{errors.password}</div>}
                    
                    <p>Need Account? <Link to="/register" className="link">Create an account</Link></p>
                    
                    <div className="login-btn">
                        <input type="submit" value="Log in" className="login-top" />
                    </div>
                </form>
            </div>
        </motion.div>
    );
}

export default Login;