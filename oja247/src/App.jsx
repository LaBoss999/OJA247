import { BrowserRouter, Routes, Route } from "react-router-dom";
import Businesses from "./pages/Businesses";
import BusinessDetails from "./pages/BusinessDetails"; // this will be next step

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Businesses />} />
        <Route path="/business/:id" element={<BusinessDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
