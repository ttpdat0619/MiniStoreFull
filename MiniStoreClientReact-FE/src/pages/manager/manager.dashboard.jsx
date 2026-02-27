import './ManagerDashboard.css';

const ManagerDashboard = () => (
  <div className="manager-container">
    <h1 className="manager-title">👔 KHU VỰC QUẢN LÝ (MANAGER)</h1>
    <p>Quản lý kho hàng và báo cáo doanh thu tại đây.</p>
    <button onClick={() => { localStorage.clear(); window.location.href = '/'; }}>Đăng xuất</button>
  </div>
);
export default ManagerDashboard;