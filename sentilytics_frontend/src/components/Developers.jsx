import React from 'react';
import "../styles/developers.css";

const Developers = () => {
  const developers = [
    {
      name: "Akil Shaikh",
      role: "Backend Developer",
      github: "https://github.com/Akil-Shaikh",
      linkedin: "https://www.linkedin.com/in/akil-shaikh-49118a285/"
    },
    {
      name: "Shahid Shaikh",
      role: "Frontend Developer",
      github: "http://github.com/shahid-0812/",
      linkedin: "https://www.linkedin.com/in/shahidshaikh555/",
     
    },
    {
      name: "Akbar Ali",
      role: "Backend Developer",
      github: "https://github.com/AkbarALIIII ",
      linkedin: "https://www.linkedin.com/in/akbar-ali-musamji-008212238/",
    
    }
  ];

  return (
    <section className="developers-section">
      <h2>Meet Our Team</h2>
      <div className="developers-grid">
        {developers.map((dev, index) => (
          <div key={index} className="developer-card">
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