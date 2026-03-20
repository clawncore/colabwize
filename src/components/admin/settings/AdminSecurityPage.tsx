import React from 'react';
import AccountSettingsPage from '../../settings/Account';

export const AdminSecurityPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <AccountSettingsPage />
    </div>
  );
};

export default AdminSecurityPage;
