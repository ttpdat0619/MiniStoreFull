import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import wastageApi from "../../../api/wastage.api";
import itemApi from "../../../api/item.api";
import { getDomain } from "../../../api/axiosClient";
import SearchableSelect from "../../../components/common/SearchableSelect";
import SafeImage from "../../../components/common/SafeImage";
import "./EditWastage.css";

const EditWastage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [allItems, setAllItems] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [previewModal, setPreviewModal] = useState(null);
    const API_BASE_URL = getDomain();

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const itemRes = await itemApi.getAllItem();
                const itemList = itemRes.data.data || [];
                setAllItems(itemList);

                const wasteRes = await wastageApi.getDetail(id);
                const data = wasteRes.data.data;

                const mapped = data.details.map(d => ({
                    id: d.DetailID,
                    ItemID: d.ItemID,
                    Quantity: d.Quantity,
                    Reason: d.WastageReason,
                    WastagePicture: d.WastagePicture,
                    preview: d.WastagePicture ? `${API_BASE_URL.replace(/\/$/, '')}${d.WastagePicture}` : null,
                    unitName: d.item?.unit?.UnitName || '...',
                    hasNewPhoto: false
                }));
                setSelectedRows(mapped);
            } catch (err) {
                console.error("Load Data Error:", err);
                alert("Failed to load request data!");
                navigate(`/wastage/detail/${id}`);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [id, navigate, API_BASE_URL]);

    const handleAddLine = () => {
        setSelectedRows([...selectedRows, {
            id: Date.now(),
            ItemID: '',
            Quantity: '',
            Reason: '',
            WastagePicture: null,
            preview: null,
            unitName: '...',
            hasNewPhoto: true
        }]);
    };

    const handleRemoveLine = (targetId) => {
        setSelectedRows(selectedRows.filter(row => row.id !== targetId));
    };

    const handleRowChange = (targetId, field, value) => {
        setSelectedRows(selectedRows.map(row => {
            if (row.id === targetId) {
                if (field === 'ItemID') {
                    const item = allItems.find(i => i.ItemID === value);
                    return { ...row, ItemID: value, unitName: item?.unit?.UnitName || '...' };
                }
                return { ...row, [field]: value };
            }
            return row;
        }));
    };

    const handlePhotoChange = (targetId, file) => {
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setSelectedRows(selectedRows.map(row => {
                if (row.id === targetId) {
                    return { ...row, WastagePicture: file, preview: previewUrl, hasNewPhoto: true };
                }
                return row;
            }));
        }
    };

    const handleSaveChanges = async () => {
        const newValidationErrors = {};
        let isInvalid = false;

        selectedRows.forEach(row => {
            const rowErrors = {};
            if (!row.ItemID) rowErrors.ItemID = true;
            if (!row.Quantity || parseFloat(row.Quantity) <= 0) rowErrors.Quantity = true;
            if (!row.preview) rowErrors.Photo = true;
            if (!row.Reason.trim()) rowErrors.Reason = true;

            if (Object.keys(rowErrors).length > 0) {
                newValidationErrors[row.id] = rowErrors;
                isInvalid = true;
            }
        });

        if (isInvalid) {
            setErrors(newValidationErrors);
            return alert("Mandatory fields are missing! Check photos, quantities, and reasons.");
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            const itemsPayload = selectedRows.map(row => ({
                ItemID: row.ItemID,
                Quantity: parseFloat(row.Quantity),
                Reason: row.Reason,
                WastagePicture: (typeof row.WastagePicture === 'string' && !row.hasNewPhoto) ? row.WastagePicture : null,
                hasNewPhoto: row.hasNewPhoto
            }));

            selectedRows.forEach((row, idx) => {
                if (row.hasNewPhoto && row.WastagePicture instanceof File) {
                    formData.append(`item_photo_${idx}`, row.WastagePicture);
                }
            });

            formData.append("items", JSON.stringify(itemsPayload));
            await wastageApi.updateWastage(id, formData);
            alert("Request updated successfully!");
            navigate(`/wastage/detail/${id}`);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update record!");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="edit-wastage-loading">Fetching details...</div>;

    return (
        <div className="edit-wastage-container">
            <div className="edit-wastage-wrapper">
                <header className="edit-header-section">
                    <h1>Edit Wastage Request</h1>
                    <p className="request-meta">ID: {id}</p>
                    <button className="btn-back" onClick={() => navigate(`/wastage/detail/${id}`)}>← DISCARD CHANGES</button>
                </header>

                <div className="wastage-form-body">
                    {selectedRows.map((row, idx) => (
                        <div key={row.id} className={`wastage-item-card ${errors[row.id] ? 'error-pulse' : ''}`}>
                            <div className="wastage-item-header">
                                <span className="item-index">Item #{idx + 1}</span>
                                <button className="wastage-btn-icon" style={{ color: '#dc3545', fontSize: '11px' }} onClick={() => handleRemoveLine(row.id)}>
                                    🗑️ REMOVE
                                </button>
                            </div>

                            <div className="wastage-grid">
                                <div className="grid-main">
                                    <label className="wastage-label">Select Product</label>
                                    <SearchableSelect
                                        items={allItems}
                                        value={row.ItemID}
                                        onChange={(v) => handleRowChange(row.id, 'ItemID', v)}
                                    />
                                    {errors[row.id]?.ItemID && <small className="error-text">Required</small>}
                                </div>

                                <div className="grid-unit">
                                    <label className="wastage-label">Unit</label>
                                    <div className="wastage-input readonly">{row.unitName}</div>
                                </div>

                                <div className="grid-qty">
                                    <label className="wastage-label">Quantity</label>
                                    <input
                                        type="number"
                                        className="wastage-input"
                                        value={row.Quantity}
                                        onChange={(e) => handleRowChange(row.id, 'Quantity', e.target.value)}
                                    />
                                    {errors[row.id]?.Quantity && <small className="error-text">Invalid</small>}
                                </div>

                                <div className="grid-photo">
                                    <label className="wastage-label">Photo</label>
                                    <div className="photo-edit-container">
                                        <div className="photo-preview-wrapper" onClick={() => row.preview && setPreviewModal(row.preview)}>
                                            {row.preview ? (
                                                <SafeImage src={row.preview} alt="item" className="photo-preview-img" />
                                            ) : (
                                                <div className="photo-empty">📷</div>
                                            )}
                                            {row.preview && <div className="preview-overlay">🔍 View</div>}
                                        </div>
                                        <label className="btn-change-photo">
                                            {row.hasNewPhoto ? "🔄 Change" : "✏️ Edit"}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={(e) => handlePhotoChange(row.id, e.target.files[0])}
                                            />
                                        </label>
                                    </div>
                                    {errors[row.id]?.Photo && <small className="error-text">Required</small>}
                                </div>
                            </div>

                            <div className="wastage-full-row" style={{ marginTop: '20px' }}>
                                <label className="wastage-label">Reason for Wastage</label>
                                <textarea
                                    className="wastage-input"
                                    rows="2"
                                    placeholder="Enter detailed reason here..."
                                    value={row.Reason}
                                    onChange={(e) => handleRowChange(row.id, 'Reason', e.target.value)}
                                />
                                {errors[row.id]?.Reason && <small className="error-text">Required</small>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="form-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '40px' }}>
                    <button className="btn-add-item" onClick={handleAddLine}>+ ADD ANOTHER ITEM</button>
                    <button
                        className="btn-submit-wastage"
                        onClick={handleSaveChanges}
                        disabled={submitting}
                    >
                        {submitting ? "UPLOADING..." : "SAVE ALL CHANGES"}
                    </button>
                </div>
            </div>

            {/* Preview Modal */}
            {previewModal && (
                <div className="img-modal" onClick={() => setPreviewModal(null)}>
                    <SafeImage src={previewModal} alt="Preview large" />
                </div>
            )}
        </div>
    );
};

export default EditWastage;
