import React from 'react'
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import DownloadButton from '../components/downloadButton';
import { Line, Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import "../styles/youtubeComment.css"

const YoutubeComment = () => {
    const navigate = useNavigate();
    const [vid_url, setvid_url] = useState("");
    const [batchname, setBatchname] = useState("");
    const [batchId, setBatchId] = useState("");
    const [analyzedComments, setAnalyzedComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [BarChart, setbarchart] = useState([]);
    const [wordcloud, setwordcloud] = useState("");
    const [filter, setFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("comments"); // Added activeTab state for tab switching
    const barRef = useRef(null);
    const lineRef = useRef(null);

    const downloadChart = () => {
        const b64_b = barRef.current.toBase64Image();
        const b64_l = lineRef.current.toBase64Image();
        const b64_w = wordcloud
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
    const handlebatchnameChange = (event) => {
        setBatchname(event.target.value);
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem("token");
        console.log("Token:", token);

        const formData = new FormData();
        formData.append("vid_url", vid_url);
        formData.append("batchname", batchname);

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

    const sentimentData = {
        labels: Object.keys(BarChart),
        datasets: [
            {
                label: "Sentiment Distribution",
                data: Object.values(BarChart),
                backgroundColor: ["#F44336", "#FF9800", "#4CAF50"], // Green, Orange, Red
            },
        ],
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
                    <input type="text" name="batchname" value={batchname} onChange={handlebatchnameChange} placeholder="Enter batch name" className="multi-input" disabled={loading} />

                    <input type="submit" value="Submit" className="btn-pages" disabled={loading} />

                </form>
            </div>

            <div className="yt-comments-section">
                <h1>Analyzed Comments</h1>
                {
                    loading ? (
                        <div className="loading-spinner">
                            <svg aria-hidden="true" className="spinner text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                    ) : analyzedComments.length > 0 ? (
                        <>
                            <div className="tab-container">

                                <button onClick={() => navigate(`/dashboard/batch/${batchId}`)} className="btn-pages">Get More Details</button>


                                {
                                    activeTab === "comments" ? <DownloadButton batch_Id={batchId} comment_type="Youtube" />
                                        :
                                        <button onClick={downloadChart} className="btn-pages" >Download Charts</button>


                                }






                                <button onClick={() => setActiveTab("comments")} className={`btn-pages ${activeTab === "comments" ? "page-active" : ""}`} > Comments</button>




                                <button onClick={() => setActiveTab("chart")} className={`btn-pages ${activeTab === "chart" ? "page-active" : ""}`} > Charts</button>


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
                                            {wordcloud && <img src={wordcloud} alt="Word Cloud" />}
                                        </div>
                                    </div>
                                </div>)}

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

                                            <table className="table">
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
                                                            <td className={`comment ${comment.comment.length > 400 && "expandable"}`}> {comment.comment}</td>
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
            </div >
        </>
    );
};

export default YoutubeComment;