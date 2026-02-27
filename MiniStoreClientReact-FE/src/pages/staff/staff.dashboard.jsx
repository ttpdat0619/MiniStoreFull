import './StaffDashboard.css';

const StaffDashboard = () => (
  <div className="staff-container">
    <h1 className="staff-title">🏪 GIAO DIỆN BÁN HÀNG (STAFF)</h1>
    <p>Chào nhân viên. Thực hiện lên đơn hàng cho khách.</p>
    <button onClick={() => { localStorage.clear(); window.location.href = '/'; }}>Đăng xuất</button>
  </div>
);
export default StaffDashboard;