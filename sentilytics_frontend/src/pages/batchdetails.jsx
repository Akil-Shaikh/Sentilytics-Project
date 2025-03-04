import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true, // ✅ Show AM/PM format
    });
};

const BatchDetails = () => {
    const { batch_id } = useParams();
    const navigate = useNavigate();

    const [batchData, setBatchData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all"); // ✅ Filtering state

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        const fetchBatchDetails = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/get/multiple/batch/${batch_id}/`, {
                    method: "GET",
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    setBatchData(data);
                } else {
                    setError("Failed to fetch batch details.");
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setError("Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        fetchBatchDetails();
    }, [batch_id, navigate]);

    if (loading) {
        return <h2>Loading batch details...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    // ✅ Filter comments based on sentiment selection
    const filteredComments = batchData?.comments?.filter((comment) => {
        if (filter === "all") return true;
        return comment.sentiment.toLowerCase() === filter;
    });

    return (
        <div>
            <button onClick={() => navigate(-1)}>⬅ Go Back</button>

            <h2>Batch Details</h2>
            <p><strong>Batch ID:</strong> {batchData?.batch_id}</p>
            <p><strong>Type:</strong> {batchData?.comment_type}</p>
            <p><strong>Date Created:</strong> {formatDate(batchData?.date_created)}</p>

            {/* ✅ Dropdown for filtering comments */}
            <label><strong>Filter Comments:</strong></label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="none">None</option>
            </select>

            <h3>Comments</h3>
            <h3>Sentiment Analysis Charts</h3>
            {batchData?.BarChart && (
                <div>
                    <h4>Sentiment Distribution</h4>
                    <img src={batchData.BarChart} alt="Sentiment Bar Chart" />
                </div>
            )}

            {batchData?.wordcloud && (
                <div>
                    <h4>Word Cloud</h4>
                    <img src={batchData.wordcloud} alt="Word Cloud" />
                </div>
            )}
            {filteredComments.length > 0 ? (
                <ul>
                    {filteredComments.map((comment, index) => (
                        <li key={index} style={{ marginBottom: "15px", padding: "10px", borderBottom: "1px solid #ccc" }}>
                            <strong>Comment:</strong> {comment.comment} <br />
                            <strong>Cleaned:</strong> {comment.cleaned_text} <br />
                            <strong>Sentiment:</strong> {comment.sentiment} <br />
                            <strong>Score:</strong> {comment.score}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No comments found for the selected sentiment.</p>
            )}

            {/* ✅ Sentiment Analysis Charts */}
           
        </div>
    );
};

export default BatchDetails;
