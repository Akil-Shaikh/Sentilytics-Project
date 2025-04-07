import "../styles/single_comment.css";
import { useState } from "react";
import Swal from "sweetalert2";

function SingleComment() {
    const [text, setText] = useState("");
    const [analyzedComment, setAnalyzedComment] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem("token");
        const trimmed = text.trim();
        if (!trimmed) {
            Swal.fire({
                icon: "error",
                title: "Analysis Failed",
                text: "Please enter a comment before submitting.",
            });
            return;
        }
        const cleaned = trimmed.replace(/[^\w\s]/g, "");

        // Match at least one or more words with 2+ letters
        const words = cleaned.match(/\b[a-zA-Z]{2,}\b/g);

        if (!words || words.length < 1) {
            Swal.fire({
                icon: "error",
                title: "Analysis Failed",
                text: "Please enter at least one valid word .",
            });
            return;
        }


        const formData = new FormData();
        formData.append("text", text);

        try {
            setLoading(true);
            const response = await fetch("http://127.0.0.1:8000/api/single/", {
                method: "POST",
                headers: token ? { Authorization: `Token ${token}` } : {},
                body: formData,
            });

            const data = await response.json();
            console.log("Response Data:", data);

            if (response.ok) {
                setAnalyzedComment(data);
            } else {
                alert(`Error: ${data.error || "Failed to analyze sentiment"}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="single-comment">
            <form className="single-form" onSubmit={handleSubmit}>
                <h1>Analyze Single Comments</h1>
                <div className="form-inputs">
                    <input
                        type="text"
                        name="text"
                        placeholder="Enter Your Comment"
                        className="single-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <input type="submit" value={loading ? "Analyzing..." : "Submit"} className="btn-pages" disabled={loading} />
                </div>
                {analyzedComment && (
                    <div className="analysis-result">
                        <h2 className={`single-${analyzedComment.sentiment}`}>Sentiment: {analyzedComment.sentiment}</h2>
                        <h2>Score: {analyzedComment.score}</h2>
                    </div>
                )}
            </form>
        </div>
    );
}

export default SingleComment;
