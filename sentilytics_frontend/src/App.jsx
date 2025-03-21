import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css"
import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import MultiComment from "./pages/multi_comment";
import YoutubeComment from "./pages/youtube_comment";
import Dashboard from "./pages/dashboard";
import BatchDetails from "./pages/batchdetails";
import UseSentilytics from "./pages/use_sentilytics";
import About from "./pages/about";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageNotFound from "./pages/pagenotfound";
import Homeopt from "./pages/homeopt";
import SingleComment from "./pages/single_comment";
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const showNavbar = location.pathname !== "/login" && location.pathname !== "/register";
  const showFooter = location.pathname !== "/login" && location.pathname !== "/register";

  return (
    <div className="app-layout">
      {showNavbar && <Navbar />}
      <div className="main-content">
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/" element={<Homeopt/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/multi_comment" element={<MultiComment />} />
          <Route path="/use_sentilytics" element={<UseSentilytics />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/batch/:batch_id" element={<BatchDetails />} />
          <Route path="/youtube_comment" element={<YoutubeComment />} />
          <Route path="/single_comment" element={<SingleComment />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<PageNotFound/>} />
        </Routes>
      </div>
      {/* {showFooter && <Footer />} */}
    </div>
  );
}


export default App;
