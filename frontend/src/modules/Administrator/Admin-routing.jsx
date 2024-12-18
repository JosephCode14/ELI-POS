import React from "react";
import { Routes, Route } from "react-router-dom";

import MasterList from "./sub-modules/UserMasterData/MasterList";
import UserRole from "./sub-modules/UserMasterData/UserRole";

const AdminRouting = () => {
  return (
    <Routes>
      <Route path="/master" element={<MasterList />} />
      <Route path="/admin/userRole" element={<UserRole />} />
    </Routes>
  );
};

export default AdminRouting;
