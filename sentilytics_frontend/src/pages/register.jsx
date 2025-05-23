import "../styles/register.css";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import Swal from "sweetalert2";

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading,setLoading]=useState(false)
    const [errors, setErrors] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const validateUsername = (username) => {
        if (username.length <= 3) {
            return "Username must be at least 4 characters long.";
        }
        if (username.length > 20) {
            return "Username must be less then 20 characters.";
        }

        const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!validUsernameRegex.test(username)) {
            return "Username can only contain letters, numbers, and underscores (_).";
        }

        return "";
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return "Please enter a valid email address";
        }
        return "";
    };

    const validatePassword = (password) => {
        const errors = [];

        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        const missing = [];

        if (!hasLowercase) missing.push("one lowercase letter");
        if (!hasUppercase) missing.push("one uppercase letter");
        if (!hasNumber) missing.push("one number");

        // If length is less than 8, prepend that requirement
        if (password.length < 8) {
            if (missing.length > 0) {
                return `Password must be at least 8 characters long and must include at least ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")}.`;
            } else {
                return `Password must be at least 8 characters long.`;
            }
        }

        // If length is okay but other constraints missing
        if (missing.length > 0) {
            return `Password must include at least ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")}.`;
        }

        return ""; // All good
    };

    const validateConfirmPassword = (confirmPassword, password) => {
        if (confirmPassword !== password) {
            return "Passwords do not match";
        }
        return "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validate field on change
        let error = "";
        switch (name) {
            case "username":
                error = validateUsername(value);
                break;
            case "email":
                error = validateEmail(value);
                break;
            case "password":
                error = validatePassword(value);
                // Also validate confirm password if it has a value
                if (formData.confirmPassword) {
                    const confirmError = validateConfirmPassword(formData.confirmPassword, value);
                    setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
                }
                break;
            case "confirmPassword":
                error = validateConfirmPassword(value, formData.password);
                break;
            default:
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const validateForm = () => {
        const usernameError = validateUsername(formData.username);
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

        setErrors({
            username: usernameError,
            email: emailError,
            password: passwordError,
            confirmPassword: confirmPasswordError,
        });

        return !(usernameError || emailError || passwordError || confirmPasswordError);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }
        setLoading(true)
        try {
            const response = await fetch("http://127.0.0.1:8000/api/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", formData.username);

                // SweetAlert2 success popup
                Swal.fire({
                    icon: "success",
                    title: "Registered successfully!",
                    showConfirmButton: true,
                    confirmButtonText: "OK"
                }).then(() => {
                    navigate("/");
                });

            } else {
                if (data.error) {
                    if (typeof data.error === 'object') {
                        const apiErrors = {};
                        Object.keys(data.error).forEach(field => {
                            apiErrors[field] = data.error[field];
                        });
                        setErrors(prev => ({ ...prev, ...apiErrors }));
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Registration Failed",
                            text: data.error,
                        });
                    }
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Registration Failed",
                        text: "Please try again.",
                    });
                }
            }
        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                icon: "error",
                title: "Network Error",
                text: "Registration failed. Please check your connection and try again.",
            });
        }
        finally{
            setLoading(false)
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
                    <input
                        type="text"
                        name="username"
                        className={`register-input ${errors.username ? 'error-input' : ''}`}
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    {errors.username && <div className="error-message">{errors.username}</div>}

                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        className={`register-input ${errors.email ? 'error-input' : ''}`}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}

                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        className={`register-input ${errors.password ? 'error-input' : ''}`}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    {errors.password && <div className="error-message">{errors.password}</div>}



                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        className={`register-input ${errors.confirmPassword ? 'error-input' : ''}`}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}

                    <p>Already have an account? <Link to="/login" className="link">Log in</Link></p>
                    <div className="register-btn">
                        <input type="submit" value={loading?"Registering...":"Register"} disabled={loading} className={!loading?"register-top":"login-loading"} />
                    </div>
                </form>
            </div>
        </motion.div>
    );
}

export default Register;