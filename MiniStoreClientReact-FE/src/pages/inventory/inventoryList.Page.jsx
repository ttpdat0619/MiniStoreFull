import { useEffect, useState } from 'react';
import inventoryApi from '../../api/inventory.api';
import './inventory.Page.css';

const InventoryList = () => {
    const [inventories, setInventories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await inventoryApi.getAll();
                setInventories(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Hàm loại bỏ dấu tiếng Việt để search chính xác hơn
    const removeAccents = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    };

    // Hàm search gần đúng (Fuzzy Search): kiểm tra các ký tự có xuất hiện theo đúng thứ tự không
    const isFuzzyMatch = (target, search) => {
        const t = removeAccents(target);
        const s = removeAccents(search);
        let searchIdx = 0;
        for (let i = 0; i < t.length && searchIdx < s.length; i++) {
            if (t[i] === s[searchIdx]) {
                searchIdx++;
            }
        }
        return searchIdx === s.length;
    };

    const filteredData = inventories.filter(item => {
        const itemName = item.item?.ItemName || '';
        return isFuzzyMatch(itemName, searchTerm);
    });

    if (loading) return <div className="loading-state">Data Loading...</div>;

    return (
        <div className="inventory-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="inventory-header" style={{ margin: 0 }}>Inventory List</h2>

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
                        <th className="text-center">Quantity Stock</th>
                        <th>Description</th>
                        <th className="text-center">Min Stock</th>
                        <th>Last Update</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                No items found matching "{searchTerm}"
                            </td>
                        </tr>
                    ) : filteredData.map((item) => (
                        <tr key={item.InventoryID}>
                            <td style={{ fontWeight: 'bold' }}>{item.item?.ItemName || 'N/A'}</td>
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