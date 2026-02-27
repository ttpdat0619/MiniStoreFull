import { useState } from 'react';
import authApi from '../../api/auth/auth.api';
import './login.css';

const Login = ({ onLoginSuccess }) => {
    const [user, setUser] = useState({ username: '', password: '' });
    const [err, setErr] = useState('');
    // 1. Thêm state để quản lý trạng thái hiện/ẩn
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authApi.login(user.username, user.password);
            onLoginSuccess(response.data.data);
        } catch (err) {
            setErr(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="login-container">
            <h3>HỆ THỐNG MINISTORE</h3>
            <form onSubmit={handleSubmit}>
                <input
                    className="login-input"
                    placeholder="Username"
                    onChange={e => setUser({ ...user, username: e.target.value })}
                />

                {/* 2. Bọc input password vào một div để chèn icon */}
                <div className="password-wrapper">
                    <input
                        className="login-input"
                        // 3. Thay đổi type dựa trên state
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        onChange={e => setUser({ ...user, password: e.target.value })}
                    />
                    {/* 4. Nút icon con mắt */}
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            // Icon Mắt gạch (Ẩn)
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                        ) : (
                            // Icon Mắt (Hiện)
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                    </button>
                </div>

                <button className="btn-submit" type="submit">ĐĂNG NHẬP</button>
            </form>
            {err && <p className="error-text">{err}</p>}
        </div>
    );
};

export default Login;