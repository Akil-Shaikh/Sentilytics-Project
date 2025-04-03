import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import { Outlet } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import MultiComment from "./pages/multi_comment";
import YoutubeComment from "./pages/youtube_comment";
import BatchDetails from "./pages/batchdetails";
import UserStats from "./pages/userStats";
import Navbar from "./components/Navbar";
import PageNotFound from "./pages/pagenotfound";
import SingleComment from "./pages/single_comment";
import DashboardSidebar from "./components/DashBoardSidebar";
import ManageComments from "./pages/ManageComments";
import ManageBatch from "./pages/managebatch";


function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

const UserLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-main-content">
        <Outlet />
      </div>
    </div>
  );
};

function AppContent() {
  return (
<Routes>
  {/* General routes for non-dashboard pages */}
  <Route path="/" element={<UserLayout />}>
    <Route index element={<Home />} />
    <Route path="multi_comment" element={<MultiComment />} />
    <Route path="youtube_comment" element={<YoutubeComment />} />
    <Route path="single_comment" element={<SingleComment />} />
  </Route>
  {/* Auth Routes (No Layout) */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Dashboard routes, nested under /dashboard */}
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route path="stats" element={<UserStats />} />
    <Route path="comments" element={<ManageComments />} />
    <Route path="batch" element={<ManageBatch />} />
    <Route path="batch/:batch_id" element={<BatchDetails />} />
  </Route>
  {/* Page Not Found */}
  <Route path="*" element={<PageNotFound />} />
</Routes>
  );
}


export default App;


