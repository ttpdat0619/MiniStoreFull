import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import importApi from '../../api/import.api';
import './import.Page.css';

const ImportDelete = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const cleanId = id?.replaceAll(' ', '-');
                const res = await importApi.getDetail(cleanId);
                setRequest(res.data.data);
            } catch (err) {
                console.error("Fetch Detail Error:", err);
                alert("Cannot load request details for deletion.");
                navigate('/import');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate]);

    const handleDelete = async () => {
        // Double confirmation
        const firstCheck = window.confirm("Are you SURE you want to DELETE this purchase request? This action cannot be undone.");
        if (!firstCheck) return;

        const secondCheck = window.confirm("FINAL WARNING: All data for this order will be permanently removed. Proceed?");
        if (!secondCheck) return;

        setIsDeleting(true);
        try {
            await importApi.deletePurchaseRequest(id);
            alert("Order deleted successfully!");
            navigate('/import');
        } catch (err) {
            console.error("Delete Error:", err);
            alert(err.response?.data?.message || "Failed to delete order. Check your permissions and the 2-day limit.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <div className="import-container"><p style={{ textAlign: 'center', marginTop: '50px' }}>Loading order details...</p></div>;

    if (!request) return <div className="import-container"><p style={{ textAlign: 'center', marginTop: '50px' }}>Order not found.</p></div>;

    return (
        <div className="import-container">
            <div className="import-content-wrapper detail-page" style={{ maxWidth: '800px' }}>
                <button className="btn-back" onClick={() => navigate(`/import/detail/${id}`)}>← BACK TO DETAIL</button>

                <div className="detail-header" style={{ marginTop: '20px', textAlign: 'center', background: 'rgba(220, 53, 69, 0.05)', padding: '30px', borderRadius: '12px', border: '1px solid #dc3545' }}>
                    <h2 style={{ color: '#dc3545' }}>CONFIRM DELETION</h2>
                    <p>You are about to delete order: <strong>#{String(request.RequestID || id).substring(0, 8).toUpperCase()}</strong></p>
                    <p style={{ color: '#888', fontSize: '13px' }}>Created on: {new Date(request.CreateAt).toLocaleString()}</p>
                </div>

                <div style={{ marginTop: '30px', background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ marginBottom: '15px' }}>Items to be deleted:</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-sub)', fontSize: '12px' }}>
                                <th style={{ textAlign: 'left', padding: '10px' }}>Item Name</th>
                                <th style={{ textAlign: 'center', padding: '10px' }}>Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {request.details?.map((detail, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{detail.item?.ItemName}</td>
                                    <td style={{ textAlign: 'center', padding: '10px' }}>{detail.Quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center', padding: '20px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeeba', color: '#856404' }}>
                    <strong>⚠️ Important Notice:</strong> Deletion is only allowed for the creator (Manager) within 2 days of creation. Admins cannot delete orders.
                </div>

                <div className="detail-actions" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
                    <button
                        className="tab-item"
                        style={{ padding: '12px 40px', background: 'var(--border-color)', color: 'var(--text-main)', border: 'none' }}
                        onClick={() => navigate(`/import/detail/${id}`)}
                    >
                        CANCEL
                    </button>
                    <button
                        className="tab-item active"
                        style={{ padding: '12px 50px', background: '#dc3545', border: 'none', fontWeight: 'bold' }}
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'DELETING...' : 'CONFIRM DELETE'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportDelete;
