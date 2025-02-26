import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import CalendarPage from '../pages/CalendarPage';
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
