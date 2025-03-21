import React from 'react'
import "../styles/notfound.css"

const PageNotFound = ({text}) => {
    return (
        <div className='pagenotfound'>
            <h1>404 - Page Not Found</h1>
            <p>{text ? text : "We are sorry but the page you are looking for does not exist." }</p>
        </div>
    )
}

export default PageNotFound
