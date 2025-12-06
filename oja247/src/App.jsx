import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ExplorePage from "./pages/ExplorePage";
import BusinessForm from "./pages/BusinessForm";
import BusinessDetails from "./pages/BusinessDetails";
import BusinessDashboard from "./pages/BusinessDashboard";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Cart from "./pages/Cart";

// ⭐ NEW PAGES
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccess from "./pages/OrderSuccess";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/business/:id" element={<BusinessDetails />} />
        <Route path="/cart" element={<Cart />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/business-form" element={<BusinessForm />} />

        {/* ⭐ New Cart + Payment Routes */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success/:reference" element={<OrderSuccess />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard/:businessId"
          element={
            <ProtectedRoute>
              <BusinessDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
