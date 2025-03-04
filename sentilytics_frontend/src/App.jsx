import Login from "./pages/login"
import Register from "./pages/register"
import Home from "./pages/home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MultiComment from "./pages/multi_comment";
import YoutubeComment from "./pages/youtube_comment";
import Dashboard from "./pages/dashboard";
import BatchDetails from "./pages/batchdetails";
import UseSentilytics from "./pages/use_sentilytics";

function App() {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/multi_comment" element={<MultiComment />}></Route>
        <Route path="/use_sentilytics" element={<UseSentilytics />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/batch/:batch_id" element={<BatchDetails />} />
        <Route path="/youtube_comment" element={<YoutubeComment />}></Route>
      </Routes>
    </Router>

  )
}

export default App
