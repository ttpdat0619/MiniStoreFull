import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import wastageApi from "../../../api/wastage.api";
import itemApi from "../../../api/item.api";
import { getDomain } from "../../../api/axiosClient";
import SearchableSelect from "../../../components/common/SearchableSelect";
import "./EditWastage.page.css";

const EditWastage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [allItems, setAllItems] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const API_BASE_URL = getDomain();

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 1. Fetch available inventory items
                const itemRes = await itemApi.getAllItem();
                const itemList = itemRes.data.data || [];
                setAllItems(itemList);

                // 2. Fetch current wastage request details
                const wasteRes = await wastageApi.getDetail(id);
                const data = wasteRes.data.data;

                // 3. Map for the form state
                const mapped = data.details.map(d => ({
                    id: d.DetailID,
                    ItemID: d.ItemID,
                    Quantity: d.Quantity,
                    Reason: d.WastageReason,
                    WastagePicture: d.WastagePicture, // Existing path
                    preview: d.WastagePicture ? `${API_BASE_URL.replace(/\/$/, '')}${d.WastagePicture}` : null,
                    unitName: d.item?.unit?.UnitName || '...',
                    hasNewPhoto: false // Flag to notify BE if a file upload is needed
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
        // Validation check
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

            // Map payloads and keep indices consistent for Multer
            const itemsPayload = selectedRows.map(row => ({
                ItemID: row.ItemID,
                Quantity: parseFloat(row.Quantity),
                Reason: row.Reason,
                WastagePicture: typeof row.WastagePicture === 'string' ? row.WastagePicture : null,
                hasNewPhoto: row.hasNewPhoto
            }));

            // Append new files specifically by index
            selectedRows.forEach((row, idx) => {
                if (row.hasNewPhoto && row.WastagePicture instanceof File) {
                    formData.append(`item_photo_${idx}`, row.WastagePicture);
                    itemsPayload[idx].hasPhoto = true;
                }
            });

            formData.append("items", JSON.stringify(itemsPayload)); // Consistent with Create

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
            <div className="edit-wastage-card">
                <header className="edit-wastage-header">
                    <button className="btn-secondary" onClick={() => navigate(`/wastage/detail/${id}`)}>← DISCARD</button>
                    <h1>Edit Wastage Request</h1>
                </header>

                <div className="wastage-form-body">
                    {selectedRows.map((row, idx) => (
                        <div key={row.id} className={`wastage-item-box ${errors[row.id] ? 'error-pulse' : ''}`}>
                            <div className="item-box-head">
                                <span>Item Index: {idx + 1}</span>
                                <button className="btn-delete-item" onClick={() => handleRemoveLine(row.id)}>DELETE ENTRY</button>
                            </div>

                            <div className="item-box-grid">
                                <div className="input-field-main">
                                    <label>SELECT PRODUCT</label>
                                    <SearchableSelect items={allItems} value={row.ItemID} onChange={(v) => handleRowChange(row.id, 'ItemID', v)} />
                                </div>
                                <div className="input-field-unit">
                                    <label>UNIT</label>
                                    <div className="readonly-box">{row.unitName}</div>
                                </div>
                                <div className="input-field-qty">
                                    <label>QUANTITY</label>
                                    <input type="number" step="0.01" className="styled-input" value={row.Quantity} onChange={(e) => handleRowChange(row.id, 'Quantity', e.target.value)} />
                                </div>
                                <div className="input-field-photo">
                                    <label>PHOTO</label>
                                    <label className="photo-dropzone">
                                        <input type="file" hidden accept="image/*" onChange={(e) => handlePhotoChange(row.id, e.target.files[0])} />
                                        {row.preview ? <img src={row.preview} alt="preview" /> : <span>📷</span>}
                                    </label>
                                </div>
                            </div>
                            <div className="item-box-wide">
                                <label>WASTAGE REASON</label>
                                <input type="text" className="styled-input" placeholder="Detailed reason..." value={row.Reason} onChange={(e) => handleRowChange(row.id, 'Reason', e.target.value)} />
                            </div>
                        </div>
                    ))}
                </div>

                <footer className="edit-wastage-footer">
                    <button className="btn-add-item" onClick={handleAddLine}>+ ADD NEW ENTRY</button>
                    <button className="btn-save-request" onClick={handleSaveChanges} disabled={submitting}>
                        {submitting ? "UPLOADING..." : "SAVE ALL CHANGES"}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default EditWastage;
