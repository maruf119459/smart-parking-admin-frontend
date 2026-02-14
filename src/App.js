import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import Navbar from "./components/Navbar";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
<Navbar></Navbar>
        <Routes>
         
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
