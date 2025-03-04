import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/multiComment.css";

const MultiComment = () => {
    const navigate = useNavigate();


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    const [file, setFile] = useState(null);
    const [column, setColumn] = useState("");
    const [analyzedComments, setAnalyzedComments] = useState([]);
    const [BarChart, setbarchart] = useState("");
    const [wordcloud, setwordcloud] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleColumnChange = (event) => {
        setColumn(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem("token");
        console.log("Token:", token);
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
            console.log("Response Data:", data);

            if (response.ok) {
                setAnalyzedComments(data.analyzed_comments); // ✅ Store data in state
                setbarchart(data.BarChart); // ✅ Store data in state
                setwordcloud(data.wordcloud); // ✅ Store data in state
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong!");
        } finally {
            setLoading(false); // ✅ Hide "Analyzing data..." after response
        }
    };


    return (
        <>
            <div className="multi-container">
                <h1>Multiple Comment Analysis</h1>
                <form onSubmit={handleSubmit} className="multi-form">
                    <label htmlFor="file-upload" className="multi-file">Choose Files</label>
                    <input type="file" id="file-upload" accept=".csv" name="file" onChange={handleFileChange} className="hidden-file" />
                    <input type="text" name="column" value={column} onChange={handleColumnChange} placeholder="Enter column name" className="multi-input" />
                    <input type="submit" value="Submit" className="multi-submit" />
                </form>
            </div>
            <div className="comments-section">
                <h1>Analyzed Comments</h1>
                {
                    loading?
                        <p>Analyzing Comments....</p>
                    :
                    analyzedComments.length > 0 ? (
                        <>
                            {BarChart && <img src={BarChart} alt="Bar Chart" />}
                            {wordcloud && <img src={wordcloud} alt="Word Cloud" />}
                            <ul className="comments">
                                {analyzedComments.map((comment, index) => (
                                    <li key={index} className={comment.sentiment}>
                                        <strong>Comment:</strong> {comment.comment} <br />
                                        <strong>Sentiment:</strong> {comment.sentiment} <br />
                                        <strong>Score:</strong> {comment.score}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>No analyzed comments yet.</p>
                    )}
            </div>
        </>

    );
};

export default MultiComment;
