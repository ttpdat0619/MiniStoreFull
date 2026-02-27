import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateWastage.page.css";
import itemApi from "../../../api/item.api";
import wastageApi from "../../../api/wastage.api";
import SearchableSelect from "../../../components/common/SearchableSelect";

const CreateWastage = () => {
    const navigate = useNavigate();
    const [allItems, setAllItems] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({}); // Track validation errors: { rowId: { field: true } }

    useEffect(() => {
        const loadItems = async () => {
            try {
                const res = await itemApi.getAllItem();
                setAllItems(res.data.data || []);
            } catch (err) {
                console.error("Load items error:", err);
            }
        };
        loadItems();
    }, []);

    const handleAddRow = () => {
        setSelectedRows([...selectedRows, {
            id: Date.now(),
            ItemID: '',
            Quantity: '', // Default to empty to allow easy typing
            Reason: '',
            WastagePicture: null,
            preview: null,
            unitName: '...'
        }]);
    };

    const handleRemoveRow = (id) => {
        setSelectedRows(selectedRows.filter(row => row.id !== id));
    };

    const handleChangeRow = (id, field, value) => {
        const updated = selectedRows.map(row => {
            if (row.id === id) {
                if (field === 'ItemID') {
                    const found = allItems.find(i => i.ItemID === value);
                    return {
                        ...row,
                        ItemID: value,
                        unitName: found?.unit?.UnitName || '...'
                    };
                }

                // Clear error for this field when user types
                if (errors[id]?.[field]) {
                    const newErrors = { ...errors };
                    delete newErrors[id][field];
                    setErrors(newErrors);
                }

                return { ...row, [field]: value };
            }
            return row;
        });
        setSelectedRows(updated);
    };

    const handleFileChange = (id, file) => {
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            const updated = selectedRows.map(row => {
                if (row.id === id) {
                    // Clear error for photo
                    if (errors[id]?.Photo) {
                        const newErrors = { ...errors };
                        delete newErrors[id].Photo;
                        setErrors(newErrors);
                    }
                    return { ...row, WastagePicture: file, preview: previewUrl };
                }
                return row;
            });
            setSelectedRows(updated);
        }
    };

    const handleSubmit = async () => {
        // Validation logic
        const newErrors = {};
        let hasError = false;

        if (selectedRows.length === 0) {
            return alert("Please add at least one item!");
        }

        selectedRows.forEach(row => {
            const rowErrors = {};
            if (!row.ItemID) rowErrors.ItemID = true;
            if (!row.Quantity || parseFloat(row.Quantity) <= 0) rowErrors.Quantity = true;
            if (!row.WastagePicture) rowErrors.Photo = true;
            if (!row.Reason.trim()) rowErrors.Reason = true;

            if (Object.keys(rowErrors).length > 0) {
                newErrors[row.id] = rowErrors;
                hasError = true;
            }
        });

        if (hasError) {
            setErrors(newErrors);
            return alert("Please fill in all mandatory fields, including photos and reasons for each item!");
        }

        setLoading(true);
        try {
            const formData = new FormData();

            // Backend expects "items" as a JSON string
            const itemsPayload = selectedRows.map(row => ({
                ItemID: row.ItemID,
                Quantity: parseFloat(row.Quantity),
                Reason: row.Reason
            }));
            formData.append("items", JSON.stringify(itemsPayload));

            // Append files with unique INDEXED names to guarantee 100% accurate mapping in BE
            selectedRows.forEach((row, index) => {
                if (row.WastagePicture) {
                    // We name the field specifically with the index
                    formData.append(`item_photo_${index}`, row.WastagePicture);
                    itemsPayload[index].hasPhoto = true;
                }
            });
            formData.set("items", JSON.stringify(itemsPayload));

            await wastageApi.createWastage(formData);
            alert("Wastage Request created successfully!");
            navigate("/wastage");
        } catch (err) {
            alert(err.response?.data?.message || "Error creating wastage request!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-wastage-container">
            <div className="create-wastage-wrapper">
                <button className="btn-back" onClick={() => navigate('/wastage')}>← BACK</button>

                <h1 style={{ textAlign: 'center', margin: '20px 0', textTransform: 'uppercase', color: '#dc3545' }}>
                    Create Wastage Request
                </h1>

                <div className="wastage-rows-container">
                    {selectedRows.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '50px', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
                            <p style={{ color: '#888', marginBottom: '15px' }}>No items added yet.</p>
                            <button className="btn-submit-wastage" style={{ background: '#007bff' }} onClick={handleAddRow}>
                                Start Adding Items
                            </button>
                        </div>
                    )}

                    {selectedRows.map((row, index) => (
                        <div key={row.id} className="wastage-item-card">
                            <div className="wastage-item-header">
                                <span className="wastage-item-index">Item #{index + 1}</span>
                                <button
                                    className="wastage-btn-icon"
                                    style={{ color: '#dc3545', fontSize: '14px' }}
                                    onClick={() => handleRemoveRow(row.id)}
                                >
                                    🗑️ REMOVE
                                </button>
                            </div>

                            <div className="wastage-row-1">
                                <div style={{ flex: 3 }}>
                                    <label className="wastage-label">SELECT ITEM</label>
                                    <div className={errors[row.id]?.ItemID ? 'invalid-select' : ''}>
                                        <SearchableSelect
                                            items={allItems}
                                            value={row.ItemID}
                                            onChange={(val) => handleChangeRow(row.id, 'ItemID', val)}
                                        />
                                    </div>
                                </div>
                                <div style={{ width: '100px' }}>
                                    <label className="wastage-label">UNIT</label>
                                    <div className="wastage-unit-display">{row.unitName}</div>
                                </div>
                                <div style={{ width: '100px' }}>
                                    <label className="wastage-label">QUANTITY</label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        className={`wastage-input ${errors[row.id]?.Quantity ? 'invalid' : ''}`}
                                        value={row.Quantity}
                                        placeholder="0.00"
                                        onChange={(e) => handleChangeRow(row.id, 'Quantity', e.target.value)}
                                    />
                                </div>
                                <div style={{ width: '60px', textAlign: 'center' }}>
                                    <label className="wastage-label">PHOTO</label>
                                    <label className={`wastage-photo-upload ${errors[row.id]?.Photo ? 'invalid' : ''}`}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={(e) => handleFileChange(row.id, e.target.files[0])}
                                        />
                                        {row.preview ? (
                                            <img src={row.preview} className="wastage-photo-preview" alt="preview" />
                                        ) : (
                                            <span className="wastage-photo-placeholder">📷</span>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="wastage-row-2">
                                <div style={{ flex: 1 }}>
                                    <label className="wastage-label">REASON WHY MANAGER WANT TO WASTAGE</label>
                                    <input
                                        type="text"
                                        className={`wastage-input ${errors[row.id]?.Reason ? 'invalid' : ''}`}
                                        placeholder="Enter reason (e.g., Damaged, Expired...)"
                                        value={row.Reason}
                                        onChange={(e) => handleChangeRow(row.id, 'Reason', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedRows.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button className="btn-add-wastage" onClick={handleAddRow}>
                            + Add Item to Wastage
                        </button>

                        <div className="create-wastage-footer">
                            <button className="btn-back" onClick={() => navigate('/wastage')}>CANCEL</button>
                            <button
                                className="btn-submit-wastage"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "SENDING..." : "SEND REQUEST"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateWastage;
