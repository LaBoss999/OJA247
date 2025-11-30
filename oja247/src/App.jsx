import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ExplorePage from "./pages/ExplorePage";
import BusinessForm from "./pages/BusinessForm";
import BusinessDetails from "./pages/BusinessDetails";
import BusinessDashboard from "./pages/BusinessDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/business-form" element={<BusinessForm />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/business/:id" element={<BusinessDetails />} /> {/* Changed from /businesses/:id */}
        <Route path="/dashboard/:businessId" element={<BusinessDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;