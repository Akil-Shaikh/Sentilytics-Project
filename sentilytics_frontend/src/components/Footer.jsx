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
                <div className="social-icons">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-github"></i>
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-linkedin"></i>
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-twitter"></i>
                    </a>
                </div>
            </div>
        </footer>
    )
}

export default Footer
