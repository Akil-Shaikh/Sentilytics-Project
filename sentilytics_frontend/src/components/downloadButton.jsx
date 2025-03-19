import '../styles/downloadButton.css'
const DownloadButton = ({batch_Id,comment_type}) => {
    const handleDownload = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/download/${batch_Id}/`, {
                method: "GET",
                headers: {
                    "Authorization": `Token ${localStorage.getItem("token")}`, // Include token if required
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            // Convert response to Blob (binary data)
            const blob = await response.blob();

            // Create a URL for the Blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary anchor element to trigger download
            const a = document.createElement("a");
            a.href = url;
            a.download = `sentiment_analayis_${comment_type}_comments.xlsx`; // Set the filename
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download file. Please try again.");
        }
    };
    return (<button className="btn-download" onClick={handleDownload}>Download Excel</button>);
}
export default DownloadButton