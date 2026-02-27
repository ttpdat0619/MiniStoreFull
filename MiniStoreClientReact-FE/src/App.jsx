import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/login/login';
import Header from './components/layout/header';
import { handleRoleRedirection } from './utils/auth.Handler';
import './App.css';

import InventoryList from './pages/inventory/inventoryList.Page';
import LowStock from './pages/inventory/inventoryLowStock.Page';
import ImportInventory from './pages/import/importInventory.Page';
import CreateImport from './pages/import/creeateImport.page';
import ImportDetail from './pages/import/importDetail.page';
import ImportApprove from './pages/import/importApprove.page';
import EditImport from './pages/import/EditImport.page';
import ImportDelete from './pages/import/ImportDelete.page';
import WastageInventory from './pages/wastage/WastageInventory/WastageInventory.page';
import CreateWastage from './pages/wastage/CreateWastage/CreateWastage.page';
import WastageDetail from './pages/wastage/WastageDetail/WastageDetail.page';
import ProcessWastage from './pages/wastage/ProcessWastage/ProcessWastage.page';
import EditWastage from './pages/wastage/EditWastage/EditWastage.page';

// Component phụ để xử lý hiển thị Header dựa trên Route
const MainLayout = ({ currentUser, theme, toggleTheme, children }) => {
    const location = useLocation();
    // Kiểm tra xem có đang ở trang Login không
    const isLoginPage = location.pathname === '/' || location.pathname === '/login';

    return (
        <div className="App">
            {/* Truyền theme và toggleTheme xuống Header */}
            {currentUser && !isLoginPage && (
                <Header user={currentUser} theme={theme} toggleTheme={toggleTheme} />
            )}
            <div className={!isLoginPage ? "main-content" : ""}>
                {children}
            </div>
        </div>
    );
};

const LoginWrapper = ({ setCurrentUser }) => {
    const navigate = useNavigate();
    const onLoginSuccess = (data) => {
        localStorage.setItem('currentUser', JSON.stringify(data.userInfo));
        setCurrentUser(data.userInfo);
        handleRoleRedirection(data, navigate);
    };
    return <Login onLoginSuccess={onLoginSuccess} />;
};

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        const storeUser = localStorage.getItem('currentUser');
        if (storeUser) {
            setCurrentUser(JSON.parse(storeUser));
        }
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }

    return (
        <Router>
            <MainLayout currentUser={currentUser} theme={theme} toggleTheme={toggleTheme}>
                <Routes>
                    <Route path="/" element={<LoginWrapper setCurrentUser={setCurrentUser} />} />
                    <Route path="/login" element={<LoginWrapper setCurrentUser={setCurrentUser} />} />
                    <Route path="/inventory" element={<InventoryList />} />
                    <Route path="/inventory/low-stock" element={<LowStock />} />
                    <Route path="/import" element={<ImportInventory />} />
                    <Route path="/import/create" element={<CreateImport />} />
                    <Route path="/import/detail/:id" element={<ImportDetail />} />
                    <Route path="/import/approve/:id" element={<ImportApprove />} />
                    <Route path="/import/edit/:id" element={<EditImport />} />
                    <Route path="/import/delete/:id" element={<ImportDelete />} />
                    <Route path="/wastage" element={<WastageInventory />} />
                    <Route path="/wastage/create" element={<CreateWastage />} />
                    <Route path="/wastage/detail/:id" element={<WastageDetail />} />
                    <Route path="/wastage/process/:id" element={<ProcessWastage />} />
                    <Route path="/wastage/edit/:id" element={<EditWastage />} />
                    <Route path="/admin" element={<h1>Admin Dashboard Content</h1>} />
                    <Route path="/manager" element={<h1>Manager Dashboard Content</h1>} />
                    <Route path="/staff" element={<h1>Staff Dashboard Content</h1>} />
                </Routes>
            </MainLayout>
        </Router>
    );
}

export default App;