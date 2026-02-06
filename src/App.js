import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import PublicRoute from "./routes/PublicRoute"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>
          <Route path="/register" element={<PublicRoute> <Register /> </PublicRoute>} />
         
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
