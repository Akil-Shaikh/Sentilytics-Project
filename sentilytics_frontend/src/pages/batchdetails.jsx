import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Line, Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import "../styles/batchdetails.css";
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

        return <div class="text-center loading-align">
            <div role="status">
                <svg aria-hidden="true" class="inline w-15 h-15 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
                <span class="sr-only">Loading...</span>
            </div></div>;
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
                    <button className={`tab ${activeTab === "comments" ? "active" : ""}`} onClick={() => { setActiveTab("comments"); }}>
                        Comments
                    </button>
                    <button className={`tab ${activeTab === "chart" ? "active" : ""}`} onClick={() => { setActiveTab("chart"); }}>
                        Charts
                    </button>
                    {activeTab === "comments" ? <DownloadButton batch_Id={batch_id} comment_type={batchData?.comment_type} />
                        : <button className="btn-download" onClick={downloadChart}>Download Chart</button>}
                    <button onClick={() => handleDelete(batch_id)} className="confirm-btn">Delete</button>
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
                        <table border="1" width="100%" cellPadding="8" className="batch-table">
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
                                            <td className="comment">{comment.comment}</td>
                                            {!editMode ? <td className={`batch-${comment.sentiment}`}>{comment.sentiment || "N/A"}</td> : (!comment.is_updated ? (
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

                                            ) : (<td className={`batch-${comment.sentiment}`}>{comment.sentiment || "N/A"}</td>
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