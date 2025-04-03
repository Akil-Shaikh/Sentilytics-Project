import React from 'react';
import "../styles/developers.css";

const Developers = () => {
  const developers = [
    {
      name: "Akil Shaikh",
      role: "Backend Developer",
      github: "https://github.com/akilshaikh",
      linkedin: "https://linkedin.com/in/akilshaikh",
      image: "/images/akil.jpg"
    },
    {
      name: "Shahid Shaikh",
      role: "Frontend Developer",
      github: "https://github.com/shahidshaikh",
      linkedin: "https://linkedin.com/in/shahidshaikh",
      image: "/images/shahid.jpg"
    },
    {
      name: "Akbar Ali",
      role: "Project Name Finder",
      github: "https://github.com/akbarali",
      linkedin: "https://linkedin.com/in/akbarali",
      image: "/images/akbar.jpg"
    }
  ];

  return (
    <section className="developers-section">
      <h2>Meet Our Team</h2>
      <div className="developers-grid">
        {developers.map((dev, index) => (
          <div key={index} className="developer-card">
            <div className="developer-image">
              <img src={dev.image} alt={dev.name} />
            </div>
            <div className="developer-info">
              <h3>{dev.name}</h3>
              <p>{dev.role}</p>
              <div className="social-links">
                <a href={dev.github} target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-github"></i>
                </a>
                <a href={dev.linkedin} target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Developers; 