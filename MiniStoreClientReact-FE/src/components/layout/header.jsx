import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import logoImg from '../../assets/LogoStore.jpg';
import importApi from '../../api/import.api';
import inventoryApi from '../../api/inventory.api';

const Header = ({ user, theme, toggleTheme }) => {
    const navigate = useNavigate();
    const [pendingImportCount, setPendingImportCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);

    const role = user?.RoleName;
    const branchId = user?.BranchID;

    useEffect(() => {
        if (!user) return;

        const fetchCounts = async () => {
            try {
                // 1. Fetch Low Stock Count (Admin or Manager)
                if (role === 'Admin' || role === 'Manager') {
                    const lowStockRes = await inventoryApi.getLowStock(branchId);
                    const lowStockData = lowStockRes.data?.data || lowStockRes.data || [];
                    setLowStockCount(lowStockData.length);
                }

                // 2. Fetch Pending Import Count (Only Admin)
                if (role === 'Admin') {
                    const importRes = await importApi.getAll();
                    const imports = importRes.data?.data || importRes.data || [];
                    const pendingCount = imports.filter(i => i.status?.StatusName === 'Pending').length;
                    setPendingImportCount(pendingCount);
                }
            } catch (err) {
                console.error("Error fetching header counts:", err);
            }
        };

        fetchCounts();
        // Refresh every 2 minutes or when user/role changes
        const interval = setInterval(fetchCounts, 120000);
        return () => clearInterval(interval);
    }, [user, role, branchId]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
    };

    //Function click to logo
    const goHome = () => {
        if (role === 'Admin') navigate('/admin');
        else if (role === 'Manager') navigate('/manager');
        else if (role === 'Staff') navigate('/staff');
        else navigate('/');
    };

    return (
        <header className="shared-header" style={{ backgroundColor: 'var(--header-bg)', color: 'var(--text-main)' }}>
            <div className="header-left" onClick={goHome}>
                <img src={logoImg} alt="MiniStore Logo" className="header-logo" />
                <span className="brand-name">MINI<span>STORE</span></span>
            </div>

            <nav className="header-nav">
                {/* Hiển thị nút theo Role */}
                {role === 'Admin' && (
                    <>
                        <button onClick={() => navigate('/admin/users')}>Quản lý User</button>
                        {/*Drop down Inventory*/}
                        <div className="nav-dropdown">
                            <button className="dropbtn">
                                Inventory Manage
                                {lowStockCount > 0 && <span className="notification-badge tech-badge">{lowStockCount}</span>}
                            </button>
                            <div className="dropdown-content">
                                <button onClick={() => navigate('/inventory')}>
                                    Inventory
                                </button>
                                <button onClick={() => navigate('/inventory/low-stock')}>
                                    Low Stock
                                    {lowStockCount > 0 && <span className="notification-inner">({lowStockCount})</span>}
                                </button>
                            </div>
                        </div>
                        <div className="nav-dropdown">
                            <button className="dropbtn">
                                Manage Request
                                {pendingImportCount > 0 && <span className="notification-badge primary-badge">!</span>}
                            </button>
                            <div className="dropdown-content">
                                <button onClick={() => navigate('/import')}>
                                    Import Dashboard
                                    {pendingImportCount > 0 && <span className="notification-inner">({pendingImportCount})</span>}
                                </button>
                                <button onClick={() => navigate('/wastage')}>
                                    Wastage Dashboard
                                </button>
                            </div>
                        </div>
                    </>
                )}
                {role === 'Manager' && (
                    <>
                        <button onClick={() => navigate('/manager/reports')}>Báo cáo doanh thu</button>
                        <button onClick={() => navigate('/manager/staff')}>Nhân viên</button>
                        {/*Drop down Inventory*/}
                        <div className="nav-dropdown">
                            <button className="dropbtn">
                                Inventory Manage
                                {lowStockCount > 0 && <span className="notification-badge tech-badge">{lowStockCount}</span>}
                            </button>
                            <div className="dropdown-content">
                                <button onClick={() => navigate('/inventory')}>
                                    Inventory
                                </button>
                                <button onClick={() => navigate('/inventory/low-stock')}>
                                    Low Stock
                                    {lowStockCount > 0 && <span className="notification-inner">({lowStockCount})</span>}
                                </button>
                            </div>
                        </div>
                        <div className="nav-dropdown">
                            <button className="dropbtn">Manage Request</button>
                            <div className="dropdown-content">
                                <button onClick={() => navigate('/import')}>
                                    Import Dashboard
                                </button>
                                <button onClick={() => navigate('/wastage')}>
                                    Wastage Dashboard
                                </button>
                            </div>
                        </div>
                    </>
                )}
                {role === 'Staff' && (
                    <>
                        <button onClick={() => navigate('/staff/pos')}>Bán hàng</button>
                        <button onClick={() => navigate('/staff/history')}>Lịch sử đơn</button>
                    </>
                )}
            </nav>

            <div className="header-right">
                <button
                    onClick={toggleTheme}
                    style={{ fontSize: '20px', background: 'none', border: '1px solid var(--border-color)', borderRadius: '50%', padding: '5px 10 px' }}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <div className="user-profile">
                    <span className="user-name">{user?.Username}</span>
                    <span className="user-role">{role}</span>
                </div>
                <button className="btn-signout" onClick={handleLogout}>Đăng xuất</button>
            </div>
        </header>
    );
};

export default Header;