import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ExplorePage from "./pages/ExplorePage";
import Products from "./pages/Products";
import BusinessForm from "./pages/BusinessForm";
import BusinessDetails from "./pages/BusinessDetails";
import BusinessDashboard from "./pages/BusinessDashboard";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import CartPage from "./pages/CartPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<About />} />
        <Route path="/business/:id" element={<BusinessDetails />} />
        <Route path="/cart" element={<CartPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/business-form" element={<BusinessForm />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard/:businessId"
          element={
            <ProtectedRoute>
              <BusinessDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
