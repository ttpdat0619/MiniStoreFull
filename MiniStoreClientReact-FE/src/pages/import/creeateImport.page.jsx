import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import './import.Page.css';
import itemApi from "../../api/item.api";
import importApi from "../../api/import.api";
import SearchableSelect from "../../components/common/SearchableSelect";

const CreateImport = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]); // Khởi đầu là mảng rỗng theo yêu cầu

    useEffect(() => {
        const loadItems = async () => {
            try {
                const res = await itemApi.getAllItem();
                setItems(res.data.data || []);
            } catch (err) {
                console.error("Error When take Items: ", err);
            }
        };
        loadItems();
    }, []);

    const handleAddItem = () => {
        setSelectedItems([...selectedItems, {
            id: Date.now(), ItemID: '', Quantity: 1, unitName: '', multiplier: 1, description: ''
        }]);
    };

    const handleRemoveItem = (id) => {
        setSelectedItems(selectedItems.filter(item => item.id !== id));
    };

    const handleChangeItem = (id, field, value) => {
        const updated = selectedItems.map(item => {
            if (item.id === id) {
                if (field === "ItemID") {
                    const found = items.find(i => i.ItemID === value);
                    return {
                        ...item,
                        ItemID: value,
                        unitName: found?.unit?.UnitName || '...',
                        multiplier: found?.Quantity || 1, // Dùng cột Quantity từ DB làm hệ số
                        description: found?.Description || 'No description available'
                    };
                }
                return { ...item, [field]: value };
            }
            return item;
        });
        setSelectedItems(updated);
    };

    const handleSendRequest = async () => {
        const validItems = selectedItems.filter(i => i.ItemID !== '');
        if (validItems.length === 0) {
            return alert("Please Select At Least 1 Product");
        }

        try {
            const payload = {
                items: validItems.map(i => ({ ItemID: i.ItemID, Quantity: i.Quantity }))
            };
            await importApi.createPurchaseRequest(payload);
            alert("Create Request Success!");
            navigate('/import');
        } catch (err) {
            alert(err.response?.data?.message || "Have Error when send Request!");
        }
    };

    return (
        <div className="import-container">
            <div className="import-content-wrapper">
                <button className="btn-back" onClick={() => navigate('/import')}>← BACK</button>
                <h1 style={{ textAlign: 'center', margin: '20px 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '24px' }}>
                    Create Import Request
                </h1>

                <div className="import-list">
                    {selectedItems.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px dashed var(--border-color)', margin: '10px 0' }}>
                            <p style={{ color: 'var(--text-sub)', fontSize: '15px', marginBottom: '15px' }}>
                                No items added yet. Ready to start?
                            </p>
                            <button
                                className="tab-item active"
                                style={{ padding: '10px 25px', borderRadius: '25px', fontSize: '14px' }}
                                onClick={handleAddItem}
                            >
                                + Add First Item
                            </button>
                        </div>
                    )}

                    {selectedItems.map((row, index) => (
                        <div key={row.id} className="import-card" style={{
                            marginBottom: '15px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            borderLeft: '4px solid #007bff',
                            padding: '15px 20px',
                            background: 'var(--bg-card)',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#007bff' }}>#Item {index + 1}</span>
                                <button
                                    className="btn-icon"
                                    style={{ color: '#dc3545', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    onClick={() => handleRemoveItem(row.id)}
                                >
                                    🗑️ REMOVE
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                <div style={{ flex: 4, minWidth: '180px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-sub)' }}>PRODUCT</label>
                                    <SearchableSelect
                                        items={items}
                                        value={row.ItemID}
                                        onChange={(val) => handleChangeItem(row.id, 'ItemID', val)}
                                    />
                                </div>

                                <div style={{ width: '100px' }}>
                                    <label className="compact-label" style={{ display: 'block', textAlign: 'center' }}>UNIT</label>
                                    <div className="compact-input" style={{ background: 'var(--bg-main)', color: 'var(--text-main)', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-color)', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', fontWeight: '500' }}>
                                        {row.unitName || '---'}
                                    </div>
                                </div>

                                <div style={{ width: '80px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-sub)', textAlign: 'center' }}>QTY</label>
                                    <input
                                        type="number" min="1"
                                        style={{ width: '100%', padding: '8px 5px', borderRadius: '4px', textAlign: 'center', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '14px', fontWeight: 'bold', boxSizing: 'border-box' }}
                                        value={row.Quantity}
                                        onChange={(e) => handleChangeItem(row.id, 'Quantity', parseInt(e.target.value) || 1)}
                                    />
                                </div>

                                <div style={{ width: '110px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-sub)', textAlign: 'center' }}>TOTAL (PCS)</label>
                                    <div style={{ padding: '8px', background: '#e7f1ff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #007bff', color: '#007bff', fontSize: '14px', boxSizing: 'border-box', minHeight: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {row.multiplier * row.Quantity}
                                    </div>
                                </div>
                            </div>

                            {row.ItemID && (
                                <div style={{
                                    padding: '10px 15px',
                                    background: 'rgba(0,123,255,0.05)',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    border: '1px dashed rgba(0,123,255,0.2)',
                                    display: 'flex',
                                    gap: '8px'
                                }}>
                                    <span style={{ color: '#007bff' }}>ℹ️</span>
                                    <div style={{ lineHeight: '1.4' }}>
                                        <span style={{ color: 'var(--text-sub)' }}>{row.description}</span>
                                        <span style={{ color: '#007bff', marginLeft: '10px' }}>[1 Unit = {row.multiplier} pieces]</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {selectedItems.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '25px' }}>
                        <button
                            className="tab-item"
                            style={{ padding: '10px 25px', borderRadius: '25px', fontSize: '13px', fontWeight: '600', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                            onClick={handleAddItem}
                        >
                            + ADD ANOTHER ITEM
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                            <button className="btn-back" style={{ padding: '8px 20px', fontSize: '13px' }} onClick={() => navigate('/import')}>CANCEL</button>
                            <button
                                className="tab-item active"
                                style={{ background: '#28a745', border: 'none', boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)', padding: '12px 35px', fontSize: '14px', fontWeight: 'bold' }}
                                onClick={handleSendRequest}
                            >
                                SUBMIT REQUEST
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default CreateImport;