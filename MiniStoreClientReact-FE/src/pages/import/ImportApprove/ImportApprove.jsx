import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import importApi from '../../../api/import.api';
import './ImportApprove.css';

const ImportApprove = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [isRejecting, setIsRejecting] = useState(false);
    const [reason, setReason] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Parse User Error", e);
            }
        }

        const fetchDetail = async () => {
            try {
                const cleanId = id?.replaceAll(' ', '-');
                const res = await importApi.getDetail(cleanId);
                setRequest(res.data.data);
            } catch (err) {
                console.error("Fetch Detail Error:", err);
                alert("Cannot load request detail!");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div className="import-container"><p style={{ textAlign: 'center', marginTop: '50px' }}>Loading detail...</p></div>;
    if (!request) return <div className="import-container"><p style={{ textAlign: 'center', marginTop: '50px' }}>Request not found!</p></div>;

    const isAdmin = currentUser?.RoleName === 'Admin';
    const isPending = request.status?.StatusName === 'Pending';

    if (!isAdmin) {
        return (
            <div className="import-container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <h3>Access Denied</h3>
                <p>Only Admins can process import requests.</p>
                <button className="btn-back" onClick={() => navigate('/import')}>Back to list</button>
            </div>
        );
    }

    const handleApprove = async () => {
        if (!window.confirm("Confirm APPROVE this request?")) return;
        try {
            await importApi.processInport(id, { action: 'Approved' });
            alert("Order Approved Success!");
            navigate('/import');
        } catch (err) {
            alert(err.response?.data?.message || "Error approving request!");
        }
    };

    const handleReject = async () => {
        if (reason.trim().length < 25) {
            return alert("Rejection reason must be at least 25 characters! Currently: " + reason.trim().length);
        }

        if (!window.confirm("Confirm REJECT this request?")) return;

        try {
            await importApi.processInport(id, {
                action: 'Rejected',
                reason: reason.trim()
            });
            alert("Order Rejected Successfully!");
            navigate('/import');
        } catch (err) {
            alert(err.response?.data?.message || "Error rejecting request!");
        }
    };

    return (
        <div className="import-container">
            <div className="import-content-wrapper detail-page">
                <button className="btn-back" onClick={() => navigate(`/import/detail/${id}`)}>← BACK TO DETAIL</button>

                <div className="detail-header" style={{ marginTop: '20px', background: 'var(--bg-card)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ textAlign: 'left' }}>
                            <h2 style={{ color: '#007bff', margin: 0 }}>PROCESS IMPORT REQUEST</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                                <span style={{ fontSize: '14px' }}>Order: <strong>#{String(request.RequestID || id).substring(0, 8).toUpperCase()}</strong></span>
                                <span className="branch-tag" style={{ border: '1px solid #d9e2ec' }}>
                                    📍 {request.branch?.BranchName}
                                </span>
                            </div>
                        </div>
                        <span className="status-tag status-pending" style={{ fontSize: '14px', padding: '6px 16px' }}>PENDING</span>
                    </div>
                </div>

                {!isRejecting ? (
                    <div className="process-choices" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
                        <button
                            className="tab-item active"
                            style={{ background: '#28a745', border: 'none', padding: '15px 50px', fontSize: '16px' }}
                            onClick={handleApprove}
                        >
                            ✓ APPROVE ORDER
                        </button>
                        <button
                            className="tab-item active"
                            style={{ background: '#dc3545', border: 'none', padding: '15px 50px', fontSize: '16px' }}
                            onClick={() => setIsRejecting(true)}
                        >
                            ✗ REJECT ORDER
                        </button>
                    </div>
                ) : (
                    <div className="rejection-form" style={{ maxWidth: '700px', margin: '40px auto', background: 'var(--bg-card)', padding: '30px', borderRadius: '12px', border: '2px solid #dc3545' }}>
                        <h3 style={{ color: '#dc3545', marginBottom: '20px' }}>Reason for Rejection</h3>
                        <p style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
                            Please provide a detailed reason (minimum 25 characters).
                        </p>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter the reason why this order is being rejected..."
                            style={{
                                width: '100%',
                                minHeight: '150px',
                                padding: '15px',
                                borderRadius: '8px',
                                border: '1px solid #dc3545',
                                background: 'var(--bg-main)',
                                color: 'var(--text-main)',
                                fontSize: '15px',
                                outline: 'none'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                            <span style={{ color: reason.trim().length < 25 ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                                Length: {reason.trim().length} / 25
                            </span>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button className="btn-back" onClick={() => setIsRejecting(false)}>CANCEL</button>
                                <button
                                    className="tab-item active"
                                    style={{ background: '#dc3545', border: 'none' }}
                                    onClick={handleReject}
                                >
                                    CONFIRM REJECT
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Optional summary to help admin decide */}
                <div style={{ marginTop: '50px', opacity: 0.8 }}>
                    <h4>Order Summary</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #444' }}>
                                <th style={{ padding: '10px' }}>Item</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>Qty</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {request.details?.map((detail) => (
                                <tr key={detail.DetailID} style={{ borderBottom: '1px solid #333' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{detail.item?.ItemName}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{detail.Quantity}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{detail.item?.unit?.UnitName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ImportApprove;
