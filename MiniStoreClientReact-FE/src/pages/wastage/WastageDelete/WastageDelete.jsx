import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import wastageApi from '../../../api/wastage.api';
import './WastageDelete.css';

const WastageDelete = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await wastageApi.getDetail(id);
                setRequest(res.data.data);
            } catch (err) {
                console.error("Fetch Detail Error:", err);
                alert("Cannot load wastage details for deletion.");
                navigate('/wastage');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate]);

    const handleDelete = async () => {
        const firstCheck = window.confirm("Are you SURE you want to DELETE this wastage request? This action cannot be undone.");
        if (!firstCheck) return;

        const secondCheck = window.confirm("FINAL WARNING: All records for this wastage will be permanently removed. Proceed?");
        if (!secondCheck) return;

        setIsDeleting(true);
        try {
            await wastageApi.deleteWastage(id);
            alert("Wastage Request deleted successfully!");
            navigate('/wastage');
        } catch (err) {
            console.error("Delete Error:", err);
            alert(err.response?.data?.message || "Failed to delete request. Remember managers can only delete within 72 hours.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <div className="wastage-delete-container"><p style={{ textAlign: 'center', marginTop: '50px' }}>Loading request details...</p></div>;

    if (!request) return <div className="wastage-delete-container"><p style={{ textAlign: 'center', marginTop: '50px' }}>Request not found.</p></div>;

    return (
        <div className="wastage-delete-container">
            <div className="wastage-delete-wrapper">
                <button className="btn-back-simple" onClick={() => navigate(`/wastage/detail/${id}`)}>← BACK TO DETAIL</button>

                <div className="delete-header-section">
                    <h2 className="delete-title">Confirm Deletion</h2>
                    <div className="delete-meta">
                        <span>Request ID: <strong>#{id.substring(0, 8).toUpperCase()}</strong></span>
                        <span className="branch-tag">📍 {request.branch?.BranchName}</span>
                    </div>
                </div>

                <div className="delete-preview-box">
                    <h4>Items to be removed:</h4>
                    <table className="mini-item-table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th style={{ textAlign: 'center' }}>Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {request.details?.map((detail, idx) => (
                                <tr key={idx}>
                                    <td><strong>{detail.item?.ItemName}</strong></td>
                                    <td style={{ textAlign: 'center' }}>{detail.Quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="delete-warning-box">
                    <strong>⚠️ Important Notice:</strong> Managers can only delete their own wastage requests within 72 hours of creation. Admins cannot delete on behalf of managers if this limit has passed.
                </div>

                <div className="delete-actions-row">
                    <button className="btn-cancel-del" onClick={() => navigate(`/wastage/detail/${id}`)}>
                        NEVERMIND
                    </button>
                    <button
                        className="btn-confirm-delete"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'DELETING...' : 'YES, DELETE THIS REQUEST'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WastageDelete;
