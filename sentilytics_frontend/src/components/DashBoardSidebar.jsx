import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../styles/dbsidebar.css";

const DashboardSidebar = () => {
    const navigate = useNavigate();
    const handleLogout = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch('http://127.0.0.1:8000/api/logout/', {
                method: "POST",
                headers: {
                    Authorization: `Token ${token}`,
                },
            });
            if (response.ok) {
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                alert("Logged out successfully!");
                navigate("/login");
            }
        }
        catch (error) {
            console.error("Error during loging out:", error);
        }
    };

    return (
        <div className="dashboard-sidebar">
            <h2>Dashboard</h2>



            <div className="sidebar">

                <Link className="btn-big dash" to="/dashboard/stats">
                    <i className="bi bi-person-fill"></i>
                    User Statistics
                </Link>


                <Link className="btn-big dash" to="/dashboard/comments">
                    <i className="bi bi-chat"></i>
                    Single Comment</Link>


                <Link className="btn-big dash" to="/dashboard/batch">
                    <i class="bi bi-collection"></i>
                    Batch Comments</Link>


                <Link className="btn-big dash" to="/">
                    <i className="bi bi-box-arrow-right"></i>
                    Exit Dashboard</Link>


                <div className="btn-big dash-logout" onClick={handleLogout}>Log Out</div>


            </div>



            {/* <ul>
                <li><Link to="/dashboard/stats">User Statistics</Link></li>
                <li><Link to="/dashboard/comments">Single Comments</Link></li>
                <li><Link to="/dashboard/batch">Batch Comments</Link></li>
                <li><Link to="/">Exit Dashboard</Link></li>
                <li className="logout" onClick={handleLogout}>Logout</li>
            </ul> */}
        </div>
    );
};

export default DashboardSidebar;
