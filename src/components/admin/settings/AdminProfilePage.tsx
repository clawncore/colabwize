import React from 'react';
import Profile from '../../settings/Profile';

export const AdminProfilePage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <Profile />
    </div>
  );
};

export default AdminProfilePage;
