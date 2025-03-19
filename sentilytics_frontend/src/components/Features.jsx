import React from 'react'
import "../styles/home.css"

const Features = (props) => {
    const { title, heading, info, image } = props.curElem;
    return (
        <div className="box">
            <div className="box-text">
                <p>{title}</p>
                <h1>{heading}</h1>
                <p>{info}</p>
            </div>
            <img src={image} alt="Image" />
        </div>
    )
}

export default Features
