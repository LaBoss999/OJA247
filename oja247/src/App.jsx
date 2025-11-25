import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Businesses from "./pages/Businesses";
import BusinessDetails from "./pages/BusinessDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Businesses />} />
        <Route path="/business/:id" element={<BusinessDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
