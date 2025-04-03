import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

const formatDate = (isoString) => {
    const dateObj = new Date(isoString);
    return {
        date: dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        time: dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }),
    };
};

const ManageBatch = () => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [filteredBatches, setFilteredBatches] = useState([]);
    const [sortField, setSortField] = useState("date_created");
    const [sortOrder, setSortOrder] = useState("desc");
    const [filterType, setFilterType] = useState("");
    const [loading, setLoading] = useState(false)
    const [filterSentiment, setFilterSentiment] = useState("");

    useEffect(() => {
        setLoading(true)
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        const fetchBatches = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/multiple/batch/", {
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
        Promise.all(fetchBatches())
            .then(() => setLoading(false))
            .catch(() => setLoading(false));
    }, [navigate]);


    const handleDelete = async (batchId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/multiple/batch/${batchId}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
            });

            if (response.ok) {
                setBatches((prevbatches) => prevbatches.filter(batch => batch.id !== batchId)); // Remove from UI
                setFilteredBatches((prevbatches) => prevbatches.filter(batch => batch.id !== batchId)); // Remove from UI
            } else {
                alert("Failed to delete comment.");
            }
        } catch (error) {
            alert("Error deleting comment.");
        }
    };
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

        setFilteredBatches(sortedData)
    };

    // Filtering Function
    const handleFilter = (type) => {
        let filtered = [...batches];

        if (filterType) {
            filtered = filtered.filter((batch) => batch.comment_type === filterType);
        }
        if (filterSentiment) {
            filtered = filtered.filter((batch) => batch.overall_sentiment === filterSentiment)

        }
        setFilteredBatches(filtered)
    };

    return (
        <div className="dashboard-container">
            <h2>Welcome, {localStorage.getItem("username")}!</h2>

            <h3>Your Batch Comments</h3>
            <div className="dashboard-filter">
                <label>Filter by Type:</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="type-filter">
                    <option value="">All</option>
                    <option value="CSV File">CSV File</option>
                    <option value="Excel File">Excel File</option>
                    <option value="Youtube">Youtube Comment</option>
                </select>

                <label>Filter by Sentiment:</label>
                <select value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value)}>
                    <option value="">All</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="neutral">Neutral</option>
                </select>

                <button onClick={() => handleFilter('batch')} className="btn-pages-small">Apply Filters</button>



            </div>

            {loading ? (<div class="text-center loading-align">
                <div role="status">
                    <svg aria-hidden="true" class="spinner inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                    <span class="sr-only">Loading...</span>
                </div></div>) :
                (filteredBatches.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Index</th>
                                <th>Name</th>
                                <th className={`sort-th ${sortField === "comment_type" && "active-sort"}`} onClick={() => handleSort("comment_type", "batch")}>
                                    Type {sortField === "comment_type" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                                </th>
                                <th className={`sort-th ${sortField === "date_created" && "active-sort"}`} onClick={() => handleSort("date_created", "batch")}>
                                    Date Created {sortField === "date_created" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                                </th>
                                <th>Time</th>
                                <th className={`sort-th ${sortField === "overall_sentiment" && "active-sort"}`} onClick={() => handleSort("overall_sentiment", "batch")}>
                                    Overall Sentiment {sortField === "overall_sentiment" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                                </th>
                                <th colSpan={2}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBatches.map((batch, index) => {
                                const { date, time } = formatDate(batch.date_created);
                                return (
                                    <tr key={batch.id}>
                                        <td>{index + 1}</td>
                                        <td>{batch.batchname}</td>
                                        <td>{batch.comment_type}</td>
                                        <td>{date}</td>
                                        <td>{time}</td>
                                        <td className={`dashboard-${batch.overall_sentiment}`}>{batch.overall_sentiment || "N/A"}</td>
                                        <td>
                                            <button onClick={() => navigate(`${batch.id}`)} className="btn-filter">
                                                View Comments
                                            </button>
                                        </td>
                                        <td>
                                            <button onClick={() => handleDelete(batch.id)} className="btn-filter delete-btn">Delete</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p>No batch comments found.</p>
                ))}
        </div>)
}


export default ManageBatch;