import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/multiComment.css";

const MultiComment = () => {
    const navigate = useNavigate();
    const [fileName, setFileName] = useState("");
    const [batchId, setBatchId] = useState("");
    const [file, setFile] = useState(null);
    const [column, setColumn] = useState("");
    const [analyzedComments, setAnalyzedComments] = useState([]);
    const [BarChart, setbarchart] = useState("");
    const [filter, setFilter] = useState("all");
    const [wordcloud, setwordcloud] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("comments"); // Added activeTab state for tab switching

    // Check if user is authenticated
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    // Filter comments based on sentiment
    const filteredComments = analyzedComments.filter((comment) => {
        if (filter === "all") return true;
        return comment.sentiment.toLowerCase() === filter;
    });

    // Handle file change
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
        }
        setFile(event.target.files[0]);
    };

    // Handle column input change
    const handleColumnChange = (event) => {
        setColumn(event.target.value);
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem("token");
        if (!file || !column) {
            alert("Please select a file and enter a column name.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("column", column);

        try {
            setLoading(true);
            const response = await fetch("http://127.0.0.1:8000/api/analyze/multiple/", {
                method: "POST",
                headers: token ? { Authorization: `Token ${token}` } : {},
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setBatchId(data.batch_id);
                setAnalyzedComments(data.analyzed_comments);
                setbarchart(data.BarChart);
                setwordcloud(data.wordcloud);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="multi-container">
                <div className="multi-title">
                    <i className="bi bi-file-earmark"></i>
                    <h1>Multiple Comment Analysis</h1>
                </div>
                <form onSubmit={handleSubmit} className="multi-form">
                    <label htmlFor="file-upload" className="multi-file">Choose Files</label>
                    <input type="file" id="file-upload" accept=".csv" name="file" onChange={handleFileChange} className="hidden-file" disabled={loading} />
                    {fileName && <p>File Name: {fileName}</p>}
                    <input type="text" name="column" value={column} onChange={handleColumnChange} placeholder="Enter column name" className="multi-input" disabled={loading} />
                    <input type="submit" value="Submit" className="multi-submit" disabled={loading} />
                </form>
            </div>

            <div className="multi-comments-section">
                <h1>Analyzed Comments</h1>
                {
                    loading ? (
                        <p>Performing Analysis...</p>
                    ) : analyzedComments.length > 0 ? (
                        <>
                            <button onClick={() => navigate(`/batch/${batchId}`)} className="detail-btn">Get More Details</button>
                            <div className="tab-container">
                                <button className={`tab ${activeTab === "comments" ? "active" : ""}`} onClick={() => setActiveTab("comments")}>
                                    Comments
                                </button>
                                <button className={`tab ${activeTab === "chart" ? "active" : ""}`} onClick={() => setActiveTab("chart")}>
                                    Charts
                                </button>
                            </div>

                            {activeTab === "chart" && (
                                <div className="multi-chart">
                                    <h3>Sentiment Analysis Charts</h3>
                                    <div className="chart">
                                        {BarChart && <img src={BarChart} alt="Bar Chart" className="multi-chart" />}
                                        {wordcloud && <img src={wordcloud} alt="Word Cloud" className="multi-chart" />}
                                    </div>
                                </div>
                            )}

                            {activeTab === "comments" && (
                                <div className="multi-comment-all">
                                    {filteredComments.length > 0 ? (
                                        <>
                                            <div className="filter-comment">
                                                <label><strong>Filter Comments:</strong></label>
                                                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                                    <option value="all">All</option>
                                                    <option value="positive">Positive</option>
                                                    <option value="negative">Negative</option>
                                                    <option value="neutral">Neutral</option>
                                                </select>
                                            </div>

                                            <table className="multi-table">
                                                <thead>
                                                    <tr>
                                                        <th>Index</th>
                                                        <th>Comment</th>
                                                        <th>Sentiment</th>
                                                        <th>Score</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredComments.map((comment, index) => (
                                                        <tr key={comment.id}>
                                                            <td>{index + 1}</td>
                                                            <td className="comment">{comment.comment}</td>
                                                            <td className={`multi-${comment.sentiment}`}>{comment.sentiment || "N/A"}</td>
                                                            <td>{comment.score || "N/A"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </>
                                    ) : (
                                        <p>No analyzed comments yet.</p>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <p>No analyzed comments yet.</p>
                    )
                }
            </div>
        </>
    );
};

export default MultiComment;