import './admin.dashboard.css';

const AdminDashboard = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">🚩 HỆ THỐNG QUẢN TRỊ (ADMIN)</h1>
      <p>Chào mừng Admin tối cao. Bạn có toàn quyền điều hành hệ thống.</p>
      <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
    </div>
  );
};
export default AdminDashboard;