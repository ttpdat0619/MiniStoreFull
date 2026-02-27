import { useNavigate } from 'react-router-dom';
import './Header.css';
import logoImg from '../../assets/LogoStore.jpg';

const Header = ({ user, theme, toggleTheme }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
    };

    const role = user?.RoleName;

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
                            <button className="dropbtn">Inventory Manage</button>
                            <div className="dropdown-content">
                                <button onClick={() => navigate('/inventory')}>
                                    Inventory
                                </button>
                                <button onClick={() => navigate('/inventory/low-stock')}>
                                    Low Stock
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
                {role === 'Manager' && (
                    <>
                        <button onClick={() => navigate('/manager/reports')}>Báo cáo doanh thu</button>
                        <button onClick={() => navigate('/manager/staff')}>Nhân viên</button>
                        {/*Drop down Inventory*/}
                        <div className="nav-dropdown">
                            <button className="dropbtn">Inventory Manage</button>
                            <div className="dropdown-content">
                                <button onClick={() => navigate('/inventory')}>
                                    Inventory
                                </button>
                                <button onClick={() => navigate('/inventory/low-stock')}>
                                    Low Stock
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