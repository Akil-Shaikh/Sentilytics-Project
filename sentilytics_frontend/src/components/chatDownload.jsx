import { useState } from "react";
const DownloadChart = ({ barB64, lineB64, wordcloudB64 }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    


    return (<button className="btn-download" onClick={handleDownload} disabled={isDownloading}>{isDownloading ? "Downloading..." : "Download Charts"}</button>);
}
export default DownloadChart;
