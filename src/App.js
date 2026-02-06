import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";

import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminManagement from "./pages/AdminManagement";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar></Navbar>

        <Routes>
          <Route path="/register" element={<PublicRoute> <Register /> </PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute> <ForgotPassword /></PublicRoute>} />
         
          <Route path="/AdminManagement" element={<PrivateRoute> <AdminManagement /> </PrivateRoute>} />
         
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
