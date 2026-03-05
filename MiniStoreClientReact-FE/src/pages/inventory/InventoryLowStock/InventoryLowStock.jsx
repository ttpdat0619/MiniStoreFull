import { useEffect, useState } from 'react';
import inventoryApi from '../../../api/inventory.api';
import branchApi from '../../../api/branch.api';
import './InventoryLowStock.css';

const InventoryLowStock = () => {
    const [lowStockItems, setLowStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Lấy thông tin user để phân quyền xem kho theo chi nhánh
        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        setUser(storedUser);

        if (storedUser) {
            if (storedUser.RoleName === 'Admin') {
                // Admin lấy danh sách chi nhánh để hiển thị bộ chọn
                const fetchBranches = async () => {
                    try {
                        const res = await branchApi.getAll();
                        setBranches(res.data.data || res.data);
                    } catch (err) {
                        console.error("Fetch branches error:", err);
                    }
                };
                fetchBranches();
            } else {
                // Manager/Staff mặc định xem chi nhánh của mình
                setSelectedBranchId(storedUser.BranchID);
            }
        }
    }, []);

    useEffect(() => {
        // Lấy danh sách hàng sắp hết (Low Stock)
        const fetchLowStock = async () => {
            setLoading(true);
            try {
                const res = await inventoryApi.getLowStock(selectedBranchId);
                setLowStockItems(res.data.data || res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchLowStock();
        }
    }, [selectedBranchId, user]);

    if (loading && lowStockItems.length === 0) return <div className="loading-state">Loading data...</div>;

    return (
        <div className="inventory-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2 className="inventory-header warning" style={{ margin: 0 }}>⚠️ Warning Low Stock!!!</h2>

                    {/* Admin có bộ lọc chi nhánh */}
                    {user?.RoleName === 'Admin' && (
                        <select
                            value={selectedBranchId}
                            onChange={(e) => setSelectedBranchId(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-main)',
                                outline: 'none',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">-- All Branches --</option>
                            {branches.map(branch => (
                                <option key={branch.BranchID} value={branch.BranchID}>
                                    {branch.BranchName}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {lowStockItems.length === 0 ? (
                <div className="no-data">{loading ? "Loading..." : "No Item Low Stock!"}</div>
            ) : (
                <table className="inventory-table">
                    <thead>
                        <tr>
                            {/* Đã bỏ cột Item ID */}
                            <th>Item Name</th>
                            {user?.RoleName === 'Admin' && <th>Branch</th>}
                            <th className="text-center">Quantity Stock</th>
                            <th className="text-center">Min Stock</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(lowStockItems) && lowStockItems.map((item) => (
                            <tr key={item.InventoryID}>
                                <td style={{ fontWeight: 'bold' }}>{item.item?.ItemName || 'N/A'}</td>
                                {user?.RoleName === 'Admin' && (
                                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        {item.branch?.BranchName || 'N/A'}
                                    </td>
                                )}
                                <td className="text-center stock-critical">
                                    {item.StockQuantity}
                                </td>
                                <td className="text-center">{item.MinQuantity}</td>
                                <td>
                                    <span className="badge-warning">Need Input!</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default InventoryLowStock;
