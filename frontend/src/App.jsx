import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Task from "./pages/task";
import NotFound from "./pages/notfound";


function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route: Login */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />


        {/* Protected Route: Task */}
        <Route
          path="/task"
          element={
            <PrivateRoute>
              <Task />
            </PrivateRoute>
          }
        />

        {/* Catch-all Route */}
        <Route
          path="*"
          element={
            token ? <NotFound /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
