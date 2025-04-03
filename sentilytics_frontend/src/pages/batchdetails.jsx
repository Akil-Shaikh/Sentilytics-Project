import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Line, Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

import PageNotFound from "./pagenotfound";
import DownloadButton from "../components/downloadButton";

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
    const [activeTab, setActiveTab] = useState("comments");
    const barRef = useRef(null);
    const lineRef = useRef(null);

    const downloadChart = () => {
        const b64_b = barRef.current.toBase64Image();
        const b64_l = lineRef.current.toBase64Image();
        const b64_w = batchData.wordcloud
        const link = document.createElement("a");
        link.href = b64_b;
        link.download = "bar_chart.png";
        link.click();
        link.href = b64_l;
        link.download = "line_chart.png";
        link.click();
        link.href = b64_w;
        link.download = "wordcloud.png";
        link.click();
    };
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
                    setError("Failed to fetch batch details........");
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
                alert("Batch deleted sucessfully")
                navigate(-1)
            } else {
                alert("Failed to delete comment.");
            }
        } catch (error) {
            alert("Error deleting comment.");
        }
    };

    if (loading) {

        return <h1>loading...</h1>;
    }

    if (error) {
        return <><PageNotFound text={error} /></>;
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
                        c.id === comment.id ? { ...c, corrected_sentiment: newSentiment, is_updated: true } : c
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
    const sentimentData = {
        labels: Object.keys(batchData.BarChart),
        datasets: [
            {
                label: "Sentiment Distribution",
                data: Object.values(batchData.BarChart),
                backgroundColor: ["#F44336", "#FF9800", "#4CAF50"], // Green, Orange, Red
            },
        ],
    };
    return (
        <div className="batch-container">
            <div className="batch-details">
                <h2>Batch Details</h2>
                <div className="batch-data">
                    <p><strong>Name:</strong> {batchData?.batchname}</p>
                    <p><strong>Type:</strong> {batchData?.comment_type}</p>
                    <p><strong>Date Created:</strong> {formatDate(batchData?.date_created)}</p>
                </div>
                <div className="tab-container">
                    <button className={`btn-pages ${activeTab === "comments" ? "active" : ""}`} onClick={() => { setActiveTab("comments"); }}>
                        Comments
                    </button>
                    <button className={`btn-pages ${activeTab === "chart" ? "active" : ""}`} onClick={() => { setActiveTab("chart"); }}>
                        Charts
                    </button>
                    {activeTab === "comments" ? <DownloadButton batch_Id={batch_id} comment_type={batchData?.comment_type} />
                        : <button className="btn-pages" onClick={downloadChart}>Download Chart</button>}
                    <button onClick={() => handleDelete(batch_id)} className="btn-pages">Delete</button>
                </div>
            </div>
            {activeTab === "chart" && (
                <div className="chart-container">
                    <h2>Sentiment Distribution</h2>
                    <div className="chart-div">
                        <div className="chart">
                            <Bar ref={barRef} data={sentimentData} />
                        </div>
                        <div className="chart">
                            <Line ref={lineRef} data={sentimentData} />
                        </div>
                        <div className="chart">
                            {batchData?.wordcloud && <img src={batchData.wordcloud} alt="Word Cloud" />}
                        </div>
                    </div>
                </div>)}
            {activeTab === "comments" && (
                <div className="batch-comment-all">
                    <p>Note: If the model predicted a comment sentiment incorrectly, you can correct it below.</p>
                    <button onClick={toggleEditMode} className="edit-mode">{editMode ? "Exit Edit Mode" : "Enable Edit Mode"}</button>
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
                        <table border="1" width="100%" cellPadding="8" className="table">
                            <thead>
                                <tr>
                                    <th>Index</th>
                                    <th>Comment</th>
                                    <th onClick={() => handleSort("sentiment", "single")}>
                                        Sentiment
                                    </th>
                                    {!editMode ? <th>Score</th> : <th>Acition</th>}
                                    {editMode && <th>Status</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredComments.map((comment, index) => {
                                    return (
                                        <tr key={comment.id}>
                                            <td>{index + 1}</td>
                                            <td className={`comment ${comment.comment.length>400 && "expandable"}`}>{comment.comment}</td>
                                            {!editMode ? <td className={`table-${comment.sentiment}`}>{comment.sentiment || "N/A"}</td> : (!comment.is_updated ? (
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

                                            ) : (<td className={`table-${comment.sentiment}`}>{comment.sentiment || "N/A"}</td>
                                            ))}
                                            {editMode ?
                                                (!comment.is_updated ? (
                                                    <><td>
                                                        <button className="confirm-btn" onClick={() => handleSubmitEdit(comment)} disabled={loadingEdits[comment.id]}>
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
                                                : <td> {comment?.feedback_verified === true ? "---" : comment.score}</td>
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
        </div>
    );
};
export default BatchDetails;