import { Routes, Route } from "react-router-dom";

import AdminLayout from "../modules/admin/components/AdminLayout";
import AdminDashboard from "../modules/admin/pages/AdminDashboard";
import AdminProfile from "../modules/admin/pages/AdminProfile";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;