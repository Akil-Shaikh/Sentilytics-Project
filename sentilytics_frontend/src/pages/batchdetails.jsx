import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/batchdetails.css";

const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
};

const BatchDetails = () => {
    const { batch_id } = useParams();
    const navigate = useNavigate();
    const [batchData, setBatchData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [editMode, setEditMode] = useState(false);
    const [editedValue, setEditedValue] = useState({});
    const [loadingEdits, setLoadingEdits] = useState({});

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        const fetchBatchDetails = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/multiple/batch/${batch_id}/`, {
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

    const filteredComments = batchData?.comments?.filter((comment) => {
        if (filter === "all") return true;
        return comment.sentiment.toLowerCase() === filter;
    });

    const toggleEditMode = () => {
        if (!editMode) {
            alert("You can only edit a sentiment once. Please provide genuine feedback to help improve the model.");
        }
        setEditMode(!editMode);
    };

    const handleSubmitEdit = async (comment) => {
        const token = localStorage.getItem("token");
        const newSentiment = editedValue[comment.id]?.trim();

        if (!newSentiment || newSentiment === comment.sentiment) return;

        setLoadingEdits((prev) => ({ ...prev, [comment.id]: true }));

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/multiple/batch/${batch_id}/${comment.id}/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ sentiment: newSentiment }),
            });

            if (response.ok) {
                setBatchData((prevData) => {
                    const updatedComments = prevData.comments.map((c) =>
                        c.id === comment.id ? { ...c, is_updated: true } : c
                    );
                    return { ...prevData, comments: updatedComments };
                });
            }
        } catch (error) {
            console.error("Error updating sentiment:", error);
        } finally {
            setLoadingEdits((prev) => ({ ...prev, [comment.id]: false }));
        }
    };

    return (
        <div className="batch-container">
            <div className="batch-details-all">
                <div className="batch-data">
                    <h2>Batch Details</h2>
                    <p><strong>Batch ID:</strong> {batchData?.batch_id}</p>
                    <p><strong>Type:</strong> {batchData?.comment_type}</p>
                    <p><strong>Date Created:</strong> {formatDate(batchData?.date_created)}</p>
                </div>
                <div className="batch-chart-all">
                    <h3>Sentiment Analysis Charts</h3>
                    <div className="batch-chart">
                        {batchData?.BarChart && <img src={batchData.BarChart} alt="Sentiment Bar Chart" />}
                        {batchData?.wordcloud && <img src={batchData.wordcloud} alt="Word Cloud" />}
                    </div>
                </div>
            </div>

            <button onClick={toggleEditMode}>{editMode ? "Exit Edit Mode" : "Enable Edit Mode"}</button>
            <p>Note: If the model predicted a comment sentiment incorrectly, you can correct it below.</p>

            <div className="batch-comment-all">
                <div className="filter-comment">
                    <label><strong>Filter Comments:</strong></label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All</option>
                        <option value="positive">Positive</option>
                        <option value="negative">Negative</option>
                        <option value="neutral">Neutral</option>
                    </select>
                </div>
                {filteredComments.length > 0 ? (
                    <ul className="batch-comment-list">
                        {filteredComments.map((comment) => (
                            <li key={comment.id} className={`batch-comment batch-${comment.sentiment}`}>
                                <p><strong>Comment:</strong> {comment.comment}</p>
                                <p><strong>Cleaned:</strong> {comment.cleaned_text}</p>
                                <p><strong>Sentiment:</strong> {comment.sentiment}</p>
                                {!editMode && !comment.is_updated && (<p><strong>Score: </strong>{comment.score}</p>)}
                                {editMode && !comment.is_updated && (
                                    <>
                                        <select
                                            value={editedValue[comment.id] || comment.sentiment}
                                            onChange={(e) => setEditedValue((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                                            disabled={loadingEdits[comment.id]}
                                        >
                                            <option value="positive">Positive</option>
                                            <option value="negative">Negative</option>
                                            <option value="neutral">Neutral</option>
                                        </select>
                                        <button onClick={() => handleSubmitEdit(comment)} disabled={loadingEdits[comment.id]}>
                                            {loadingEdits[comment.id] ? "Saving..." : "Confirm"}
                                        </button>
                                    </>
                                )}
                                {comment.is_updated && (
                                    <p>
                                        (Sentiment corrected){" "}
                                        {comment.feedback_verified === null
                                            ? "(Pending...)"
                                            : comment.feedback_verified === true
                                            ? "(Verified)"
                                            : "model predicted correctly"}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No comments found for the selected sentiment.</p>
                )}
            </div>
        </div>
    );
};

export default BatchDetails;
