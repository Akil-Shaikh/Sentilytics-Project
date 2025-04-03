import React from 'react'
import "../styles/footer.css"

const Footer = () => {
    return (
        <footer className='footer-container'>
            <div className="footer-left">
                <p>&copy; {new Date().getFullYear()} Sentilytics. All rights reserved.</p>
            </div>

            <div className="footer-center">
                <div className="sentiment-icons">
                    <i className="bi bi-emoji-smile"></i>
                    <i className="bi bi-emoji-frown"></i>
                    <i className="bi bi-emoji-neutral"></i>
                </div>
            </div>

            <div className="footer-right">
                <img src="/images/logo1.svg" alt="" />
            </div>
        </footer>
    )
}

export default Footer
