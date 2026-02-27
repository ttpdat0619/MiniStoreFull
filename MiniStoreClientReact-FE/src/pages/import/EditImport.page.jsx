import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import './import.Page.css';
import itemApi from "../../api/item.api";
import importApi from "../../api/import.api";
import SearchableSelect from "../../components/common/SearchableSelect";

const EditImport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [items, setItems] = useState([]); // Danh sách gốc từ kho
    const [selectedItems, setSelectedItems] = useState([]); // Danh sách đang sửa
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // 1. Lấy User hiện tại
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Parse User Error", e);
            }
        }

        const loadData = async () => {
            try {
                // 2. Load danh sách sản phẩm mẫu để chọn
                const itemRes = await itemApi.getAllItem();
                const allItems = itemRes.data.data || [];
                setItems(allItems);

                // 3. Load chi tiết đơn hàng hiện tại
                const cleanId = id?.replaceAll(' ', '-');
                const importRes = await importApi.getDetail(cleanId);
                const requestData = importRes.data.data;

                if (!requestData) throw new Error("Request data not found");

                // 4. Map dữ liệu từ DB sang format của Form
                const mappedItems = requestData.details.map(d => {
                    const found = allItems.find(i => i.ItemID === d.ItemID);
                    return {
                        id: d.DetailID, // Dùng DetailID làm key tạm
                        ItemID: d.ItemID,
                        Quantity: d.Quantity,
                        unitName: found?.unit?.UnitName || '...',
                        multiplier: found?.Quantity || 1,
                        description: found?.Description || ''
                    };
                });
                setSelectedItems(mappedItems);

            } catch (err) {
                console.error("Load Edit Data Error: ", err);
                alert(err.response?.data?.message || "Cannot load data for editing!");
                navigate(`/import/detail/${id}`);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);

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
                        multiplier: found?.Quantity || 1,
                        description: found?.Description || ''
                    };
                }
                return { ...item, [field]: value };
            }
            return item;
        });
        setSelectedItems(updated);
    };

    const handleUpdate = async () => {
        const validItems = selectedItems.filter(i => i.ItemID !== '');
        if (validItems.length === 0) {
            return alert("Please Select At Least 1 Product");
        }

        try {
            const payload = {
                items: validItems.map(i => ({ ItemID: i.ItemID, Quantity: i.Quantity }))
            };
            await importApi.updatePurchaseRequest(id, payload);
            alert("Update Request Success!");
            navigate(`/import/detail/${id}`);
        } catch (err) {
            alert(err.response?.data?.message || "Update Failed!");
        }
    };

    if (loading) return <div className="import-container"><p style={{ textAlign: 'center', marginTop: '50px' }}>Loading data for edit...</p></div>;

    return (
        <div className="import-container">
            <div className="import-content-wrapper">
                <button className="btn-back" onClick={() => navigate(`/import/detail/${id}`)}>← CANCEL & BACK</button>
                <h1 style={{ textAlign: 'center', margin: '20px 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '24px', color: '#007bff' }}>
                    Edit Import Request
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-sub)', marginBottom: '30px' }}>
                    Modifying Order: <strong>#{id.substring(0, 8).toUpperCase()}</strong>
                </p>

                <div className="import-list">
                    {selectedItems.map((row, index) => (
                        <div key={row.id} className="import-card" style={{
                            marginBottom: '15px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            borderLeft: '4px solid #ffc107', // Màu vàng cho Edit
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
                                    <div style={{ padding: '8px', background: 'rgba(0,123,255,0.1)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #007bff', color: '#007bff', fontSize: '14px', boxSizing: 'border-box', minHeight: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {row.multiplier * row.Quantity}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '25px' }}>
                    <button
                        className="tab-item"
                        style={{ padding: '10px 25px', borderRadius: '25px', fontSize: '13px', fontWeight: '600', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                        onClick={handleAddItem}
                    >
                        + ADD NEW ITEM
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <button className="btn-back" style={{ padding: '8px 20px', fontSize: '13px' }} onClick={() => navigate(`/import/detail/${id}`)}>CANCEL CHANGES</button>
                        <button
                            className="tab-item active"
                            style={{ background: '#007bff', border: 'none', boxShadow: '0 4px 10px rgba(0, 123, 255, 0.3)', padding: '12px 35px', fontSize: '14px', fontWeight: 'bold' }}
                            onClick={handleUpdate}
                        >
                            SAVE CHANGES
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditImport;
