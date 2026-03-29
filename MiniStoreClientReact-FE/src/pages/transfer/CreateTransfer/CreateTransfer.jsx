import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateTransfer.css";
import itemApi from "../../../api/item.api";
import transferApi from "../../../api/transfer.api";
import branchApi from "../../../api/branch.api";
import SearchableSelect from "../../../components/common/SearchableSelect";

const CreateTransfer = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    const [branches, setBranches] = useState([]);
    const [fromBranchId, setFromBranchId] = useState('');
    const [toBranchId, setToBranchId] = useState('');
    const [sendNote, setSendNote] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        setCurrentUser(user);

        const loadInitialData = async () => {
            try {
                // Load items
                const itemRes = await itemApi.getAllItem();
                setItems(itemRes.data.data || []);

                // Load branches
                const branchRes = await branchApi.getAll();
                const allBranches = branchRes.data.data || branchRes.data;
                setBranches(allBranches);

                // Set default fromBranch for Manager
                if (user?.RoleName !== 'Admin' && user?.BranchID) {
                    setFromBranchId(user.BranchID);
                }
            } catch (err) {
                console.error("Error loading initial data: ", err);
            }
        };
        loadInitialData();
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

    const handleSendRequest = async () => {
        const validItems = selectedItems.filter(i => i.ItemID !== '');

        if (validItems.length === 0) {
            return alert("Please select at least 1 product to transfer.");
        }

        if (!fromBranchId) {
            return alert("Source branch (From) must be selected.");
        }

        if (!toBranchId) {
            return alert("Target branch (To) must be selected.");
        }

        if (fromBranchId === toBranchId) {
            return alert("Source and target branches cannot be the same.");
        }

        try {
            const payload = {
                fromBranchId,
                toBranchId,
                items: validItems.map(i => ({ ItemID: i.ItemID, Quantity: i.Quantity })),
                sendNote
            };
            await transferApi.create(payload);
            alert("Transfer request created successfully!");
            navigate('/transfer');
        } catch (err) {
            alert(err.response?.data?.message || "Error creating transfer request.");
        }
    };

    // Filter out branches from the 'toBranch' list based on 'fromBranch' so you don't transfer to yourself
    const availableToBranches = branches.filter(b => b.BranchID !== fromBranchId);
    const availableFromBranches = branches.filter(b => b.BranchID !== toBranchId);

    return (
        <div className="transfer-container">
            <div className="transfer-content-wrapper">
                <button className="btn-back" onClick={() => navigate('/transfer')}>← BACK TO LIST</button>
                <h1 style={{ textAlign: 'center', margin: '20px 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '24px' }}>
                    Create Internal Transfer
                </h1>

                <div style={{
                    background: 'var(--bg-card)',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '25px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                }}>
                    {/* Branch Selection Section */}
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        {/* Source Branch */}
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-sub)', display: 'block', marginBottom: '8px' }}>
                                📤 FROM BRANCH: {currentUser?.RoleName !== 'Admin' && <span style={{ color: 'red' }}>*</span>}
                            </label>
                            {currentUser?.RoleName === 'Admin' ? (
                                <select
                                    value={fromBranchId}
                                    onChange={(e) => setFromBranchId(e.target.value)}
                                    className="compact-input"
                                >
                                    <option value="">-- Choose Source Branch --</option>
                                    {availableFromBranches.map(b => (
                                        <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="compact-input" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-sub)', display: 'flex', alignItems: 'center' }}>
                                    {branches.find(b => b.BranchID === currentUser?.BranchID)?.BranchName || currentUser?.BranchID} (Your Branch)
                                </div>
                            )}
                        </div>

                        {/* Destination Branch */}
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-sub)', display: 'block', marginBottom: '8px' }}>
                                📥 TO BRANCH: <span style={{ color: 'red' }}>*</span>
                            </label>
                            <select
                                value={toBranchId}
                                onChange={(e) => setToBranchId(e.target.value)}
                                className="compact-input"
                                style={{ borderColor: '#007bff' }}
                            >
                                <option value="">-- Choose Target Branch --</option>
                                {availableToBranches.map(b => (
                                    <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Transfer Note */}
                    <div>
                        <label style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-sub)', display: 'block', marginBottom: '8px' }}>
                            📝 REASON / NOTE:
                        </label>
                        <textarea
                            className="compact-input"
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            placeholder="Why are you transferring these items?"
                            value={sendNote}
                            onChange={(e) => setSendNote(e.target.value)}
                        />
                    </div>
                </div>

                <div className="transfer-list">
                    {selectedItems.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px dashed var(--border-color)', margin: '10px 0' }}>
                            <p style={{ color: 'var(--text-sub)', fontSize: '15px', marginBottom: '15px' }}>
                                No items added for transfer yet.
                            </p>
                            <button
                                className="tab-item active"
                                style={{ padding: '10px 25px', borderRadius: '25px', fontSize: '14px', background: '#007bff', color: 'white', border: 'none' }}
                                onClick={handleAddItem}
                            >
                                + Add First Item
                            </button>
                        </div>
                    )}

                    {selectedItems.map((row, index) => (
                        <div key={row.id} className="transfer-card" style={{
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
                                        excludedIds={selectedItems.map(i => i.ItemID).filter(id => id !== '')}
                                    />
                                </div>

                                <div style={{ width: '100px' }}>
                                    <label className="compact-label" style={{ display: 'block', textAlign: 'center' }}>UNIT</label>
                                    <div className="compact-input" style={{ background: 'var(--bg-main)', textAlign: 'center', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '500' }}>
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
                            <button className="btn-back" style={{ padding: '8px 20px', fontSize: '13px' }} onClick={() => navigate('/transfer')}>CANCEL</button>
                            <button
                                className="tab-item active"
                                style={{ background: '#28a745', color: 'white', border: 'none', boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)', padding: '12px 35px', fontSize: '14px', fontWeight: 'bold', borderRadius: '25px' }}
                                onClick={handleSendRequest}
                            >
                                SUBMIT TRANSFER
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateTransfer;
