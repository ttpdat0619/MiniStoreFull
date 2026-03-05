import { useEffect, useState } from 'react';
import inventoryApi from '../../../api/inventory.api';
import branchApi from '../../../api/branch.api';
import { isFuzzyMatch } from '../../../helpers/search.helper'; // Sử dụng helper cho search gần đúng
import './InventoryList.css';

const InventoryList = () => {
    const [inventories, setInventories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Lấy thông tin user từ localStorage để phân quyền
        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        setUser(storedUser);

        if (storedUser) {
            if (storedUser.RoleName === 'Admin') {
                // Nếu là Admin thì lấy danh sách chi nhánh để hiển thị bộ chọn
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
                // Nếu là Manager/Staff thì mặc định theo chi nhánh của mình
                setSelectedBranchId(storedUser.BranchID);
            }
        }
    }, []);

    useEffect(() => {
        // Hàm lấy danh sách kho
        const fetchAll = async () => {
            setLoading(true);
            try {
                const res = await inventoryApi.getAll(selectedBranchId);
                setInventories(res.data.data || res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchAll();
        }
    }, [selectedBranchId, user]);

    // Lọc dữ liệu theo từ khóa tìm kiếm (Sử dụng fuzzy search từ helper)
    const filteredData = Array.isArray(inventories) ? inventories.filter(item => {
        const itemName = item.item?.ItemName || '';
        return isFuzzyMatch(itemName, searchTerm);
    }) : [];

    if (loading && inventories.length === 0) return <div className="loading-state">Data Loading...</div>;

    return (
        <div className="inventory-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2 className="inventory-header" style={{ margin: 0 }}>Inventory List</h2>

                    {/* Chỉ hiển thị bộ chọn chi nhánh cho Admin */}
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

                {/* Box tìm kiếm */}
                <div className="search-box" style={{ position: 'relative', width: '300px' }}>
                    <input
                        type="text"
                        placeholder="Search items by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 15px',
                            borderRadius: '20px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            outline: 'none',
                            fontSize: '14px'
                        }}
                    />
                    <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                </div>
            </div>

            <table className="inventory-table">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        {user?.RoleName === 'Admin' && <th>Branch</th>}
                        <th className="text-center">Quantity Stock</th>
                        <th>Description</th>
                        <th className="text-center">Min Stock</th>
                        <th>Last Update</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.length === 0 ? (
                        <tr>
                            <td colSpan={user?.RoleName === 'Admin' ? "6" : "5"} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                {loading ? "Loading..." : `No items found matching "${searchTerm}"`}
                            </td>
                        </tr>
                    ) : filteredData.map((item) => (
                        <tr key={item.InventoryID}>
                            <td style={{ fontWeight: 'bold' }}>{item.item?.ItemName || 'N/A'}</td>
                            {user?.RoleName === 'Admin' && (
                                <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    {item.branch?.BranchName || 'N/A'}
                                </td>
                            )}
                            <td className="text-center stock-number">
                                {item.StockQuantity}
                            </td>
                            <td style={{ fontStyle: 'italic', color: '#888', fontSize: '13px' }}>
                                {item.item?.Description || ''}
                            </td>
                            <td className="text-center">{item.MinQuantity}</td>
                            <td>{item.LastUpdatedAt ? new Date(item.LastUpdatedAt).toLocaleString() : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryList;
