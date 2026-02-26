import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Student from './pages/Student';
import Tutor from './pages/Tutor';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rutas para Estudiantes */}
        <Route element={<ProtectedRoute allowedRole="STUDENT" />}>
          <Route path="/student" element={<Student />} />
        </Route>

        {/* Rutas para Tutores */}
        <Route element={<ProtectedRoute allowedRole="TUTOR" />}>
          <Route path="/tutor" element={<Tutor />} />
        </Route>

        {/* Rutas para Administradores */}
        <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* Fallback general */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
