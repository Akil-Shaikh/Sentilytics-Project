import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/dbsidebar.css";

const DashboardSidebar = () => {
    const navigate = useNavigate();
    const handleLogout = async () => {
        Swal.fire({
            title: "Are you sure?",
            text: "Log Out!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes,Log Out!",
            cancelButtonText: "Cancel",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch('http://127.0.0.1:8000/api/logout/', {
                        method: "POST",
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    });

                    if (response.ok) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("username");
                        Swal.fire("Success!", "Logged Out Sucessfully!.", "success");
                        navigate("/");

                    } else {
                        Swal.fire("Failed!", "Failed to Log Out.", "error");
                    }
                } catch (error) {
                    Swal.fire("Error!", "Something went wrong.", "error");
                    console.error("Delete error:", error);
                }
            }
        });
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
                    Single Comment
                </Link>

                <Link className="btn-big dash" to="/dashboard/batch">
                    <i class="bi bi-collection"></i>
                    Batch Comments
                </Link>

                <Link className="btn-big dash" to="/">
                    <i className="bi bi-box-arrow-right"></i>
                    Exit Dashboard
                </Link>
                <div className="btn-big dash-logout" onClick={handleLogout}>Log Out</div>
            </div>
        </div>
    );
};

export default DashboardSidebar;
