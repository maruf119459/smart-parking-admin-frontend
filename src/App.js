import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import PublicRoute from "./routes/PublicRoute";
import PrivateRroute from "./routes/PrivateRoute";

import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar></Navbar>

        <Routes>
          <Route path="/register" element={<PublicRoute> <Register /> </PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute> <ForgotPassword /></PublicRoute>} />
         
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
