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
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [commentType, setCommentType] = useState("");
    const [overallSentiment, setOverallSentiment] = useState("");
    const [order, setOrder] = useState("desc");
    const pageSize = 10;

    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        const fetchBatches = async () => {
            try {
                const queryParams = new URLSearchParams({
                    page: currentPage,
                    pageSize,
                    comment_type: commentType,
                    overall_sentiment: overallSentiment,
                    order,
                }).toString();

                const response = await fetch(`http://127.0.0.1:8000/api/multiple/batch/?${queryParams}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setBatches(data.results);
                    setTotalPages(Math.ceil(data.count / pageSize));
                } else {
                    console.error("Error fetching batches:", data);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBatches();
    }, [navigate, currentPage, commentType, overallSentiment, order]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    const handleDelete = async (batchId) => {
        if (!window.confirm("Are you sure you want to delete this Batch?")) return;
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/multiple/batch/${batchId}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
            });
            if (response.ok) {
                setBatches((prevbatches) => prevbatches.filter(batch => batch.id !== batchId)); // Remove from UI
            } else {
                alert("Failed to delete Batch.");
            }
        } catch (error) {
            alert("Error deleting comment.");
        }
    };
    return (
        <>
            <div className="dashboard-container">
                <h2>Welcome, {localStorage.getItem("username")}!</h2>
                <h3>Your Batch Comments</h3>
                <div className="filters">
                    <select value={commentType} onChange={(e) => { setCommentType(e.target.value); setCurrentPage(1) }}>
                        <option value="">All Types</option>
                        <option value="CSV File">CSV</option>
                        <option value="Excel File">Excel</option>
                        <option value="Youtube">YouTube</option>
                    </select>
                    <select value={overallSentiment} onChange={(e) => { setOverallSentiment(e.target.value); setCurrentPage(1) }}>
                        <option value="">All Sentiments</option>
                        <option value="positive">Positive</option>
                        <option value="negative">Negative</option>
                        <option value="neutral">Neutral</option>
                    </select>
                </div>
                <div className="pagination-controls">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        Previous
                    </button>
                    <span> Page {currentPage} of {totalPages} </span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            </div>
            {loading ? (
                <div class="text-center loading-align">
                    <div role="status">
                        <svg aria-hidden="true" class="inline w-15 h-15 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                        <span class="sr-only">Loading...</span>
                    </div></div>
            ) : (
                batches.length > 0 ? (
                    <>
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th onClick={() => { order === "desc" ? setOrder("asc") : setOrder("desc") }}>Date Created {order === "desc" ? 'd' : 'a'}</th>
                                    <th>Time</th>
                                    <th>Overall Sentiment</th>
                                    <th colSpan={2}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batches.map((batch, index) => {
                                    const { date, time } = formatDate(batch.date_created);
                                    return (
                                        <tr key={batch.id}>
                                            <td>{batch.batchname}</td>
                                            <td>{batch.comment_type}</td>
                                            <td>{date}</td>
                                            <td>{time}</td>
                                            <td className={`dashboard-${batch.overall_sentiment}`}>{batch.overall_sentiment || "N/A"}</td>
                                            <td>
                                                <button onClick={() => navigate(`${batch.id}`)} className="table-btnn">
                                                    View Comments
                                                </button>
                                            </td>
                                            <td>
                                                <button onClick={() => handleDelete(batch.id)} className="confirm-btn">Delete</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="pagination-controls">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                Previous
                            </button>
                            <span> Page {currentPage} of {totalPages} </span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                Next
                            </button>
                        </div></>
                ) : (
                    <p>No batch comments found.</p>
                )
            )}
        </>
    );
};

export default ManageBatch;
