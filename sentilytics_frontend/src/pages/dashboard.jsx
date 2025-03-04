import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const formatDate = (isoString) => {
    const dateObj = new Date(isoString);
    return {
        date: dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        time: dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }),
    };
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [filteredBatches, setFilteredBatches] = useState([]);
    const [sortField, setSortField] = useState("date_created");
    const [sortOrder, setSortOrder] = useState("desc");
    const [filterType, setFilterType] = useState("");
    const [filterSentiment, setFilterSentiment] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        const fetchBatches = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/get/multiple/batch/", {
                    method: "GET",
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    setBatches(data);
                    setFilteredBatches(data);
                } else {
                    console.error("Error fetching batches:", data);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        };

        fetchBatches();
    }, [navigate]);

    // Sorting Function
    const handleSort = (field) => {
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortOrder(newOrder);

        const sortedData = [...filteredBatches].sort((a, b) => {
            let valA = a[field];
            let valB = b[field];

            // Handle Date Sorting
            if (field === "date_created") {
                valA = new Date(a.date_created);
                valB = new Date(b.date_created);
            }

            if (valA < valB) return newOrder === "asc" ? -1 : 1;
            if (valA > valB) return newOrder === "asc" ? 1 : -1;
            return 0;
        });

        setFilteredBatches(sortedData);
    };

    // Filtering Function
    const handleFilter = () => {
        let filtered = [...batches];

        if (filterType) {
            filtered = filtered.filter((batch) => batch.comment_type === filterType);
        }
        if (filterSentiment) {
            filtered = filtered.filter((batch) => batch.over_all_sentiment === filterSentiment);
        }

        setFilteredBatches(filtered);
    };

    return (
        <div style={{ margin: "auto", padding: "20px" }}>
            <h2>Welcome, {localStorage.getItem("username")}!</h2>
            <h3>Your Batch Comments</h3>

            {/* Filter Section */}
            <div style={{ marginBottom: "10px" }}>
                <label>Filter by Type:</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="">All</option>
                    <option value="CSV File">CSV File</option>
                    <option value="Excel File">Excel File</option>
                    <option value="Youtube">Youtube Comment</option>
                </select>

                <label style={{ marginLeft: "10px" }}>Filter by Sentiment:</label>
                <select value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value)}>
                    <option value="">All</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="neutral">Neutral</option>
                </select>

                <button onClick={handleFilter} style={{ marginLeft: "10px", cursor: "pointer" }}>Apply Filters</button>
            </div>

            {filteredBatches.length > 0 ? (
                <table border="1" width="100%" cellPadding="8" style={{ borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f4f4f4" }}>
                            <th>Batch ID</th>
                            <th onClick={() => handleSort("comment_type")} style={{ cursor: "pointer" }}>
                                Type {sortField === "comment_type" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th onClick={() => handleSort("date_created")} style={{ cursor: "pointer" }}>
                                Date Created {sortField === "date_created" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th>Time</th>
                            <th onClick={() => handleSort("over_all_sentiment")} style={{ cursor: "pointer" }}>
                                Overall Sentiment {sortField === "over_all_sentiment" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBatches.map((batch) => {
                            const { date, time } = formatDate(batch.date_created);
                            return (
                                <tr key={batch.id}>
                                    <td>{batch.id}</td>
                                    <td>{batch.comment_type}</td>
                                    <td>{date}</td>
                                    <td>{time}</td>
                                    <td>{batch.over_all_sentiment || "N/A"}</td>
                                    <td>
                                        <button onClick={() => navigate(`/batch/${batch.id}`)} style={{ cursor: "pointer" }}>
                                            View Comments
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <p>No batch comments found.</p>
            )}
        </div>
    );
};

export default Dashboard;
