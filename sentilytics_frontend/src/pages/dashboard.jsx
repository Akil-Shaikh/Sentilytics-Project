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

const Dashboard = () => {
    const navigate = useNavigate();
    const [singleComments, setSingleComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [batches, setBatches] = useState([]);
    const [filteredBatches, setFilteredBatches] = useState([]);
    const [filteredSingleComments, setFilteredSingleComments] = useState([]);
    const [sortField, setSortField] = useState("date_created");
    const [sortOrder, setSortOrder] = useState("desc");
    const [filterType, setFilterType] = useState("");
    const [filterSentiment, setFilterSentiment] = useState("");
    const [activeTab, setActiveTab] = useState("single");
    const [editMode, setEditMode] = useState(false);
    const [editedValue, setEditedValue] = useState({});
    const [loadingEdits, setLoadingEdits] = useState({});

    useEffect(() => {
        setLoading(true)
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        const fetchBatches = async () => {
            try {
                const response = await fetch("https://sentilytics-backend.onrender.com/api/multiple/batch/", {
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

        const fetchSingleComments = async () => {
            try {
                const response = await fetch("https://sentilytics-backend.onrender.com/api/single/", {
                    method: "GET",
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    setSingleComments(data);
                    setFilteredSingleComments(data);
                } else {
                    console.error("Error fetching single comments:", data);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        };

        Promise.all([fetchBatches(), fetchSingleComments()])
            .then(() => setLoading(false))
            .catch(() => setLoading(false));
    }, [navigate]);

    const handleSubmitEdit = async (comment) => {
        const token = localStorage.getItem("token");
        const newSentiment = editedValue[comment.id]?.trim();

        if (!newSentiment || newSentiment === comment.sentiment) return; // Prevent unnecessary updates

        setLoadingEdits((prev) => ({ ...prev, [comment.id]: true }));

        try {
            const response = await fetch(`https://sentilytics-backend.onrender.com/api/single/${comment.id}/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ sentiment: newSentiment }),
            });

            if (response.ok) {
                setSingleComments((prevData) =>
                    prevData.map((c) =>
                        c.id === comment.id ? { ...c, corrected_sentiment: newSentiment, is_updated: true } : c
                    )
                );
                setFilteredSingleComments((prevData) =>
                    prevData.map((c) =>
                        c.id === comment.id ? { ...c, corrected_sentiment: newSentiment, is_updated: true } : c
                    )
                );
                setEditedValue((prev) => ({ ...prev, [comment.id]: "" })); // Clear the input after editing
            }
        } catch (error) {
            console.error("Error updating sentiment:", error);
        } finally {
            setLoadingEdits((prev) => ({ ...prev, [comment.id]: false }));
        }
    };

    //editmode
    const toggleEditMode = () => {
        if (!editMode) {
            alert("You can only edit a sentiment once. Please provide genuine feedback to help improve the model.");
        }
        setEditMode(!editMode);
    };

    // Sorting Function
    const handleSort = (field, type) => {
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortOrder(newOrder);

        const sortedData = [...(type === "batch" ? filteredBatches : filteredSingleComments)].sort((a, b) => {
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

        type === "batch" ? setFilteredBatches(sortedData) : setFilteredSingleComments(sortedData);
    };

    // Filtering Function
    const handleFilter = (type) => {
        let filtered = [...(type === "batch" ? batches : singleComments)];

        if (filterType && type === "batch") {
            filtered = filtered.filter((batch) => batch.comment_type === filterType);
        }
        if (filterSentiment) {
            type === "batch" ? (filtered = filtered.filter((batch) => batch.overall_sentiment === filterSentiment))
                : (filtered = filtered.filter((comment) => comment.sentiment === filterSentiment));

        }

        type === "batch" ? setFilteredBatches(filtered) : setFilteredSingleComments(filtered);
    };

    return (
        <div className="dashboard-container">
            <h2>Welcome, {localStorage.getItem("username")}!</h2>

            {/* Tab Navigation */}
            <div className="tab-container">
                <button className={`tab ${activeTab === "single" ? "active" : ""}`} onClick={() => { setActiveTab("single"); setFilterSentiment("") }}>
                    Single Comments
                </button>
                <button className={`tab ${activeTab === "batch" ? "active" : ""}`} onClick={() => { setActiveTab("batch"); setFilterSentiment(""), setFilterType("") }}>
                    Batch Comments
                </button>
            </div>

            {/* Single Comments Table */}
            {activeTab === "single" && (

                <div className="tab-content">
                    <h3>Your Single Comments</h3>
                    <div className="dashboard-filter">
                        <p>Note: If the model predicted a comment sentiment incorrectly, you can correct it below.</p>
                        <button className="edit-mode" onClick={toggleEditMode}>{editMode ? "Exit Edit Mode" : "Enable Edit Mode"}</button>
                        <label>Filter by Sentiment:</label>
                        <select value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value)}>
                            <option value="">All</option>
                            <option value="positive">Positive</option>
                            <option value="negative">Negative</option>
                            <option value="neutral">Neutral</option>
                        </select>

                        <button onClick={() => handleFilter('single')} className="filter-btnn">Apply Filters</button>
                    </div>
                    {loading ? (
                        <div class="text-center">
                            <div role="status">
                                <svg aria-hidden="true" class="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                </svg>
                                <span class="sr-only">Loading...</span>
                            </div></div>
                    ) :
                        filteredSingleComments.length > 0 ? (
                            <table border="1" width="100%" cellPadding="8" className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Index</th>
                                        <th>Comment</th>
                                        <th className={`sort-th ${sortField === "date_created" && "active-sort"}`} onClick={() => handleSort("date_created", "single")}>
                                            Date Created {sortField === "date_created" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                                        </th>
                                        <th>Time</th>
                                        <th className={`sort-th ${sortField === "sentiment" && "active-sort"}`} onClick={() => handleSort("sentiment", "single")}>
                                            Sentiment {sortField === "sentiment" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                                        </th>
                                        {!editMode ? <th>Score</th> : <th>Action</th>}
                                        {editMode && <th>Status</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSingleComments.map((comment, index) => {
                                        const { date, time } = formatDate(comment.date_created);
                                        return (
                                            <tr key={comment.id}>
                                                <td>{index + 1}</td>
                                                <td className="comment">{comment.comment}</td>
                                                <td>{date}</td>
                                                <td>{time}</td>
                                                {!editMode ? <td className={`dashboard-${comment.sentiment}`}>{comment.sentiment || "N/A"}</td> : (!comment.is_updated ? (
                                                    <td>
                                                        <select
                                                            value={editedValue[comment.id] || comment.sentiment}
                                                            onChange={(e) => setEditedValue((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                                                            disabled={loadingEdits[comment.id]}
                                                        >
                                                            <option value="positive">Positive</option>
                                                            <option value="negative">Negative</option>
                                                            <option value="neutral">Neutral</option>
                                                        </select>
                                                    </td>

                                                ) : (<td className={`dashboard-${comment.sentiment}`}>{comment.sentiment || "N/A"}</td>
                                                ))}
                                                {editMode ?
                                                    (!comment.is_updated ? (
                                                        <><td>
                                                            <button
                                                                className="confirm-btn"
                                                                onClick={() => handleSubmitEdit(comment)} disabled={loadingEdits[comment.id]}>
                                                                {loadingEdits[comment.id] ? "Saving..." : "Confirm"}
                                                            </button>
                                                        </td>
                                                            <td>---</td></>
                                                    ) : <>
                                                        <td>{comment.feedback_verified === null
                                                            ? `Suggestion : ${comment.corrected_sentiment}`
                                                            : comment.feedback_verified === true
                                                                ? `Prediction Error : ${comment.predicted_sentiment}`
                                                                : `Suggested : ${comment.corrected_sentiment}`}</td>

                                                        <td>{comment.feedback_verified === null
                                                            ? "Sentiment correction Pending..."
                                                            : comment.feedback_verified === true
                                                                ? "Sentiment Verified"
                                                                : "model predicted correctly"}</td>
                                                    </>
                                                    )
                                                    : <td>{comment?.feedback_verified === true ? "---" : comment.score}</td>
                                                }
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p>No single comments found.</p>
                        )}
                </div>
            )}

            {activeTab === "batch" && (<div className="tab-content">
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

                    <button onClick={() => handleFilter('batch')} className="filter-btn">Apply Filters</button>
                </div>

                {loading ? (<div class="text-center">
                    <div role="status">
                        <svg aria-hidden="true" class="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                        <span class="sr-only">Loading...</span>
                    </div></div>) :
                    (filteredBatches.length > 0 ? (
                        <table border="1" width="100%" cellPadding="8" className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Index</th>
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
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBatches.map((batch, index) => {
                                    const { date, time } = formatDate(batch.date_created);
                                    return (
                                        <tr key={batch.id}>
                                            <td>{index + 1}</td>
                                            <td>{batch.comment_type}</td>
                                            <td>{date}</td>
                                            <td>{time}</td>
                                            <td className={`dashboard-${batch.overall_sentiment}`}>{batch.overall_sentiment || "N/A"}</td>
                                            <td>
                                                <button onClick={() => navigate(`/batch/${batch.id}`)} className="table-btnn">
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
                    ))}
            </div>)}

        </div>
    );
};

export default Dashboard;