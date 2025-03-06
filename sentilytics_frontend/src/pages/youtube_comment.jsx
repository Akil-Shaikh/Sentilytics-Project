import React from 'react'
import {useState } from 'react';
import { useNavigate } from "react-router-dom";
import "../styles/youtubeComment.css"

const YoutubeComment = () => {
    const navigate=useNavigate();
    const [vid_url, setvid_url] = useState("");
    const [batchId, setBatchId] = useState("");
    const [analyzedComments, setAnalyzedComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [BarChart, setbarchart] = useState("");
    const [wordcloud, setwordcloud] = useState("");



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
                <h1>Multiple Comment Analysis</h1>
                <form action="" onSubmit={handleSubmit} className='yt-form'>
                    <label htmlFor="url" className='yt-label'>Enter URL : </label>
                    <input type="text" id="url" name="vid_url" className="yt-input" onChange={handlevidnChange} disabled={loading} placeholder='Youtube URL' />
                    <input type="submit" value="Submit" className='yt-submit' disabled={loading} />
                </form>
            </div>
            <div className="yt-comments-section">
                <h1>Analyzed Comments</h1>
                {
                    loading ? (<p>Performing Analysis</p>)
                        : analyzedComments.length > 0 ? (

                            <>
                                <button onClick={() => navigate(`/batch/${batchId}`)} className="detail-btn">Get More Details</button>
                                <div className="multi-charts">
                                    {BarChart && <img src={BarChart} alt="Bar Chart" className='yt-chart' />}
                                    {wordcloud && <img src={wordcloud} alt="Word Cloud" className='yt-chart' />}
                                </div>

                                <ul className='yt-comments'>
                                    {analyzedComments.map((comment, index) => (
                                        <li key={index} className={comment.sentiment}>
                                            <strong>Comment:</strong> {comment.comment} <br />
                                            <strong>Sentiment:</strong> {comment.sentiment} <br />
                                            <strong>Score:</strong> {comment.score}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) :
                            (
                                <p>No analyzed comments yet.</p>
                            )
                }
            </div >
        </>
    )
}

export default YoutubeComment
