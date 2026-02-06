import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>
         
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
