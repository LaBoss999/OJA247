import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Businesses from "./pages/Businesses";
import BusinessForm from "./pages/BusinessForm";
import BusinessDetails from "./pages/BusinessDetails";
import BusinessDashboard from './pages/BusinessDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/business-form" element={<BusinessForm />} />
        <Route path="/businesses" element={<Businesses />} />
        <Route path="/businesses/:id" element={<BusinessDetails />} />

        <Route path="/dashboard/:businessId" element={<BusinessDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
