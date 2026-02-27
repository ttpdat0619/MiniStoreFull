import { useEffect, useState } from 'react';
import inventoryApi from '../../api/inventory.api';
import './inventory.Page.css';

const LowStock = () => {
    const [lowStockItems, setLowStockItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                const res = await inventoryApi.getLowStock();
                setLowStockItems(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLowStock();
    }, []);

    if (loading) return <div className="loading-state">Loading data...</div>;

    return (
        <div className="inventory-container">
            <h2 className="inventory-header warning">⚠️ Warning Low Stock!!!</h2>

            {lowStockItems.length === 0 ? (
                <div className="no-data">No Item Low Stock!</div>
            ) : (
                <table className="inventory-table">
                    <thead>
                        <tr>
                            {/* Đã bỏ cột Item ID */}
                            <th>Item Name</th>
                            <th className="text-center">Quantity Stock</th>
                            <th className="text-center">Min Stock</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lowStockItems.map((item) => (
                            <tr key={item.InventoryID}>

                                <td style={{ fontWeight: 'bold' }}>{item.item?.ItemName || 'N/A'}</td>

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

export default LowStock;