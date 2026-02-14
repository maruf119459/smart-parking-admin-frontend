import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";

import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import SystemManagement from "./pages/SystemManagement";
import AdminManagement from "./pages/AdminManagement";
import CustomerService from "./pages/CustomerService";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar></Navbar>

        <Routes>
          <Route path="/register" element={<PublicRoute> <Register /> </PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute> <ForgotPassword /></PublicRoute>} />

          
          <Route path="/system-management" element={<PrivateRoute> <SystemManagement /> </PrivateRoute>} />
         
          <Route path="/AdminManagement" element={<PrivateRoute> <AdminManagement /> </PrivateRoute>} />
          <Route path="/customer-service" element={<PrivateRoute> <CustomerService /> </PrivateRoute>} />
         
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
