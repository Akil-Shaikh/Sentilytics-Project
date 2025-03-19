import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import "../styles/youtubeComment.css"

const YoutubeComment = () => {
    const navigate = useNavigate();
    const [vid_url, setvid_url] = useState("");
    const [batchId, setBatchId] = useState("");
    const [analyzedComments, setAnalyzedComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [BarChart, setbarchart] = useState("");
    const [wordcloud, setwordcloud] = useState("");
    const [filter, setFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("comments"); // Added activeTab state for tab switching

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

    const handlevidnChange = (event) => {
        setvid_url(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem("token");
        console.log("Token:", token);

        const formData = new FormData();
        formData.append("vid_url", vid_url);

        try {
            setLoading(true);
            const response = await fetch("http://127.0.0.1:8000/api/analyze/multipleYoutube/", {
                method: "POST",
                headers: token ? { Authorization: `Token ${token}` } : {},
                body: formData,
            });

            const data = await response.json();
            console.log("Response Data:", data);

            if (response.ok) {
                setBatchId(data.batch_id)
                setAnalyzedComments(data.analyzed_comments); // ✅ Store data in state
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
            <div className='yt-container'>
                <div className="yt-title">
                    <i class="bi bi-youtube"></i>
                    <h1>YouTube Comment Analysis</h1>
                </div>
                <form action="" onSubmit={handleSubmit} className='yt-form'>
                    <label htmlFor="url" className='yt-label'>Enter URL : </label>
                    <input type="text" id="url" name="vid_url" className="yt-input" onChange={handlevidnChange} disabled={loading} placeholder='Youtube URL' />
                    <input type="submit" value="Submit" className='yt-submit' disabled={loading} />
                </form>
            </div>

            <div className="yt-comments-section">
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
                                <div className="yt-chart">
                                    <h3>Sentiment Analysis Charts</h3>
                                    <div className="chart">
                                        {BarChart && <img src={BarChart} alt="Bar Chart" className="yt-chart" />}
                                        {wordcloud && <img src={wordcloud} alt="Word Cloud" className="yt-chart" />}
                                    </div>
                                </div>
                            )}

                            {activeTab === "comments" && (
                                <div className="yt-comment-all">
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

                                            <table className="yt-table">
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
                                                            <td className={`yt-${comment.sentiment}`}>{comment.sentiment || "N/A"}</td>
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

export default YoutubeComment;