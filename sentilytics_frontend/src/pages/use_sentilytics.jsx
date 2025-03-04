import React from 'react'
import { Link } from 'react-router-dom';
import "../styles/UseSentilytics.css"



const UseSentilytics = () => {
  console.log("UseSentilytics Rendered");
  return (
    <div className='use-container'>
      <div className="use-header">
        <h1>Choose Your Analysis Method</h1>
        <p>Analyze sentiments from <b>YouTube</b> comments or <b>CSV/Excel</b> files with just one click!</p>
      </div>
      <div className="use-buttons">
        <Link to="/multi_comment">CSV/Excel File Comments</Link>
        <Link to="/youtube_comment">Youtube Comments</Link>
      </div>
    </div>
  )
}

export default UseSentilytics
