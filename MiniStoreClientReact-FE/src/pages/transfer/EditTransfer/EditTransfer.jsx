import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditTransfer.css";
import itemApi from "../../../api/item.api";
import transferApi from "../../../api/transfer.api";
import SearchableSelect from "../../../components/common/SearchableSelect";

const EditTransfer = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [transfer, setTransfer] = useState(null);
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [sendNote, setSendNote] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        setCurrentUser(user);

        const loadData = async () => {
            try {
                // Load items list for dropdown
                const itemRes = await itemApi.getAllItem();
                const allItems = itemRes.data.data || [];
                setItems(allItems);

                // Load existing transfer detail
                const cleanId = id?.replaceAll(' ', '-');
                const res = await transferApi.getById(cleanId);
                const data = res.data;
                setTransfer(data);
                setSendNote(data.SendNote || '');

                // Map existing details into the editable format
                if (data.details && data.details.length > 0) {
                    const mapped = data.details.map((detail, index) => {
                        const matchedItem = allItems.find(i => i.ItemID === detail.ItemID);
                        return {
                            id: Date.now() + index,
                            ItemID: detail.ItemID,
                            Quantity: Number(detail.Quantity),
                            unitName: matchedItem?.unit?.UnitName || detail.item?.unit?.UnitName || '...',
                            multiplier: matchedItem?.Quantity || detail.item?.Quantity || 1,
                            description: matchedItem?.Description || detail.item?.Description || ''
                        };
                    });
                    setSelectedItems(mapped);
                }
            } catch (err) {
                console.error("Error loading transfer for edit:", err);
                alert(err.response?.data?.message || "Cannot load transfer data!");
                navigate('/transfer');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);

    // -- Item Handlers --
    const handleAddItem = () => {
        setSelectedItems([...selectedItems, {
            id: Date.now(), ItemID: '', Quantity: 1, unitName: '', multiplier: 1, description: ''
        }]);
    };

    const handleRemoveItem = (rowId) => {
        setSelectedItems(selectedItems.filter(item => item.id !== rowId));
    };

    const handleChangeItem = (rowId, field, value) => {
        const updated = selectedItems.map(item => {
            if (item.id === rowId) {
                if (field === "ItemID") {
                    const found = items.find(i => i.ItemID === value);
                    return {
                        ...item,
                        ItemID: value,
                        unitName: found?.unit?.UnitName || '...',
                        multiplier: found?.Quantity || 1,
                        description: found?.Description || 'No description available'
                    };
                }
                return { ...item, [field]: value };
            }
            return item;
        });
        setSelectedItems(updated);
    };

    // -- Submit Handler --
    const handleSaveEdit = async () => {
        const validItems = selectedItems.filter(i => i.ItemID !== '');

        if (validItems.length === 0) {
            return alert("Please select at least 1 product to transfer.");
        }

        if (!window.confirm("Are you sure you want to save changes to this transfer request?")) return;

        try {
            const payload = {
                items: validItems.map(i => ({ ItemID: i.ItemID, Quantity: i.Quantity })),
                sendNote
            };
            await transferApi.edit(transfer.TransferID, payload);
            alert("Transfer request updated successfully!");
            navigate(`/transfer/detail/${transfer.TransferID}`);
        } catch (err) {
            alert(err.response?.data?.message || "Error updating transfer request.");
        }
    };

    // -- Render --
    if (loading) {
        return (
            <div className="edit-transfer-container">
                <div className="edit-loading">Loading transfer data...</div>
            </div>
        );
    }

    if (!transfer) {
        return (
            <div className="edit-transfer-container">
                <div className="edit-transfer-wrapper">
                    <button className="btn-back" onClick={() => navigate('/transfer')}>← BACK</button>
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <h3>⚠️ Transfer Not Found</h3>
                        <p style={{ color: '#888' }}>ID: {id}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-transfer-container">
            <div className="edit-transfer-wrapper">
                <button className="btn-back" onClick={() => navigate(`/transfer/detail/${transfer.TransferID}`)}>← BACK TO DETAIL</button>

                <h1 className="edit-transfer-title">
                    ✏️ Edit Transfer
                    <span className="badge bg-warning text-dark">
                        TRF #{String(transfer.TransferID).substring(0, 8).toUpperCase()}
                    </span>
                </h1>

                {/* Branch Info - READ ONLY (Branches cannot be changed after creation) */}
                <div className="edit-branch-info">
                    <div className="edit-branch-row">
                        <div className="edit-branch-box">
                            <label className="edit-branch-label">📤 FROM BRANCH:</label>
                            <div className="edit-branch-display">
                                <span className="lock-icon">🔒</span>
                                {transfer.fromBranch?.BranchName || transfer.FromBranchID}
                            </div>
                        </div>

                        <div className="edit-branch-box">
                            <label className="edit-branch-label">📥 TO BRANCH:</label>
                            <div className="edit-branch-display">
                                <span className="lock-icon">🔒</span>
                                {transfer.toBranch?.BranchName || transfer.ToBranchID}
                            </div>
                        </div>
                    </div>

                    {/* Editable Note */}
                    <div>
                        <label className="edit-branch-label">📝 REASON / NOTE:</label>
                        <textarea
                            className="edit-note-area"
                            placeholder="Why are you transferring these items?"
                            value={sendNote}
                            onChange={(e) => setSendNote(e.target.value)}
                        />
                    </div>
                </div>

                {/* Items List */}
                <div className="edit-item-list">
                    {selectedItems.length === 0 && (
                        <div className="edit-empty-state">
                            <p style={{ color: 'var(--text-sub)', fontSize: '15px', marginBottom: '15px' }}>
                                No items in this transfer. Add at least one.
                            </p>
                            <button className="btn-add-item" onClick={handleAddItem}>
                                + Add First Item
                            </button>
                        </div>
                    )}

                    {selectedItems.map((row, index) => (
                        <div key={row.id} className="edit-item-card">
                            <div className="edit-item-header">
                                <span className="edit-item-number">#Item {index + 1}</span>
                                <button className="edit-item-remove" onClick={() => handleRemoveItem(row.id)}>
                                    🗑️ REMOVE
                                </button>
                            </div>

                            <div className="edit-item-row">
                                <div style={{ flex: 4, minWidth: '180px' }}>
                                    <label className="edit-compact-label">PRODUCT</label>
                                    <SearchableSelect
                                        items={items}
                                        value={row.ItemID}
                                        onChange={(val) => handleChangeItem(row.id, 'ItemID', val)}
                                        excludedIds={selectedItems.map(i => i.ItemID).filter(idVal => idVal !== '' && idVal !== row.ItemID)}
                                    />
                                </div>

                                <div style={{ width: '100px' }}>
                                    <label className="edit-compact-label" style={{ textAlign: 'center' }}>UNIT</label>
                                    <div className="edit-compact-input" style={{
                                        background: 'var(--bg-main)',
                                        textAlign: 'center',
                                        minHeight: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '500'
                                    }}>
                                        {row.unitName || '---'}
                                    </div>
                                </div>

                                <div style={{ width: '80px' }}>
                                    <label className="edit-compact-label" style={{ textAlign: 'center' }}>QTY</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="edit-compact-input"
                                        style={{ textAlign: 'center', fontWeight: 'bold' }}
                                        value={row.Quantity}
                                        onChange={(e) => handleChangeItem(row.id, 'Quantity', parseInt(e.target.value) || 1)}
                                    />
                                </div>

                                <div style={{ width: '110px' }}>
                                    <label className="edit-compact-label" style={{ textAlign: 'center' }}>TOTAL (PCS)</label>
                                    <div className="edit-total-badge">
                                        {row.multiplier * row.Quantity}
                                    </div>
                                </div>
                            </div>

                            {row.ItemID && (
                                <div className="edit-item-info">
                                    <span style={{ color: '#ffc107' }}>ℹ️</span>
                                    <div style={{ lineHeight: '1.4' }}>
                                        <span style={{ color: 'var(--text-sub)' }}>{row.description}</span>
                                        <span style={{ color: '#ffc107', marginLeft: '10px' }}>[1 Unit = {row.multiplier} pieces]</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                {selectedItems.length > 0 && (
                    <div className="edit-action-bar">
                        <button className="btn-add-item" onClick={handleAddItem}>
                            + ADD ANOTHER ITEM
                        </button>

                        <div className="edit-action-buttons">
                            <button className="btn-cancel-edit" onClick={() => navigate(`/transfer/detail/${transfer.TransferID}`)}>
                                CANCEL
                            </button>
                            <button className="btn-save-edit" onClick={handleSaveEdit}>
                                💾 SAVE CHANGES
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditTransfer;
