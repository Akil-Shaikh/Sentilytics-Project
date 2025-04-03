import React from 'react'
import "../styles/button.css"

const Button = () => {
    console.log("Button render");
    return (
        <div className="button-top">
            <input type="submit" value="Submit" className="button-comp" disabled={loading} />
        </div>
    )
}

export default Button;
