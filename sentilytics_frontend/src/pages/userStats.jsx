import { useEffect, useState } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/userstats.css";

const UserStats = () => {
    const [stats, setStats] = useState({
        total_comments: 0,
        total_batches: 0,
        total_single: 0,
        sentiment_distribution: {},
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const navigate=useNavigate()

    useEffect(() => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
            }
            fetchStats();
        }, [startDate, endDate, navigate]);

        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = "http://localhost:8000/api/dashboard-stats/";
                if (startDate && endDate) {
                    url += `?start_date=${startDate.toISOString().split("T")[0]}&end_date=${endDate.toISOString().split("T")[0]}`;
                }

                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch stats");
                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        // Chart Data
        const sentimentData = {
            labels: Object.keys(stats.sentiment_distribution),
            datasets: [
                {
                    label: "Sentiment Distribution",
                    data: Object.values(stats.sentiment_distribution),
                    backgroundColor: ["#4CAF50", "#FF9800", "#F44336"], // Green, Orange, Red
                },
            ],
        };

        if (loading) return <h2>Loading Dashboard...</h2>;
        if (error) return <h2>Error: {error}</h2>;

        return (
            <div className="admin-dashboard">
                <h1>User Statstics</h1>

                {/* Date Filter */}
                <div className="date-filters">
                    <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="Start Date" />
                    <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} placeholderText="End Date" />
                    <button onClick={fetchStats}>Apply Filter</button>
                </div>

                {/* Stats */}
                <div className="dashboard-widgets">
                    <div className="widget"><h2>Total Comments</h2><p>{stats.total_comments}</p></div>
                    <div className="widget"><h2>Total Single Comments</h2><p>{stats.total_single}</p></div>
                    <div className="widget"><h2>Total Batches</h2><p>{stats.total_batches}</p></div>
                </div>

                {/* Charts */}
                <div className="chart-container">
                    <h2>Sentiment Distribution</h2>
                    <div className="chart-div">
                        <div className="chart">
                            <Bar data={sentimentData} />
                        </div>
                        <div className="chart">
                            <Line data={sentimentData} />
                        </div>
                        {/* <div className="chart">
                        <Pie data={sentimentData} />
                    </div> */}
                    </div>
                </div>
            </div>
        );
    };

    export default UserStats;
