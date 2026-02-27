import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import wastageApi from '../../../api/wastage.api';
import { getDomain } from '../../../api/axiosClient';
import SafeImage from '../../../components/common/SafeImage';
import './WastageDetail.page.css';

const WastageDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    // Dynamic Base URL from axios config
    const API_BASE_URL = getDomain();

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }

        const fetchDetail = async () => {
            try {
                const res = await wastageApi.getDetail(id);
                setRequest(res.data.data);
            } catch (err) {
                console.error("Fetch Wastage Detail Error:", err);
                alert(err.response?.data?.message || "Cannot load wastage detail!");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div className="wastage-detail-container"><p style={{ textAlign: 'center', marginTop: '50px' }}>Loading detail...</p></div>;

    if (!request) {
        return (
            <div className="wastage-detail-container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <button className="btn-back" onClick={() => navigate('/wastage')}>← BACK</button>
                <div style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-card)', borderRadius: '8px' }}>
                    <h3>⚠️ Wastage Request Not Found!</h3>
                    <p>ID: {id}</p>
                </div>
            </div>
        );
    }

    const isAdmin = currentUser?.RoleName === 'Admin';
    const isPending = request.status?.StatusName === 'Pending';
    const isOwner = currentUser?.UserID === request.RequesterID;

    return (
        <div className="wastage-detail-container">
            <div className="wastage-detail-wrapper">
                <button className="btn-back" onClick={() => navigate('/wastage')}>← BACK TO LIST</button>

                <div className="detail-header-card" style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: 0, textTransform: 'uppercase' }}>Wastage Order #{id.substring(0, 8)}</h2>
                            <p style={{ color: 'var(--text-sub)', fontSize: '13px', margin: '5px 0' }}>
                                Created: {new Date(request.CreateAt).toLocaleString()}
                            </p>
                        </div>
                        <span className={`status-badge status-${request.status?.StatusName.toLowerCase()}`}>
                            {request.status?.StatusName}
                        </span>
                    </div>
                </div>

                <div className="detail-info-grid">
                    <div className="info-box">
                        <h4>Personnel Involvement</h4>
                        <p><strong>Requester:</strong> <span>{request.manager?.Username}</span></p>
                        <p><strong>Approver:</strong> <span>{request.approval?.Username || 'Pending...'}</span></p>
                        {request.ApprovalDate && (
                            <p><strong>Action Date:</strong> <span>{new Date(request.ApprovalDate).toLocaleString()}</span></p>
                        )}
                    </div>
                    <div className="info-box">
                        <h4>Request Summary</h4>
                        <p><strong>Total Items:</strong> <span>{request.details?.length}</span></p>
                        <p><strong>Full ID:</strong> <span style={{ fontSize: '10px' }}>{id}</span></p>
                    </div>
                </div>

                <table className="wastage-items-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>Photo</th>
                            <th>Item Name</th>
                            <th style={{ textAlign: 'center' }}>Quantity</th>
                            <th>Wastage Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {request.details?.map((detail, idx) => (
                            <tr key={detail.DetailID}>
                                <td>{idx + 1}</td>
                                <td style={{ textAlign: 'center' }}>
                                    {detail.WastagePicture ? (
                                        <SafeImage
                                            src={`${API_BASE_URL.replace(/\/$/, '')}${detail.WastagePicture}`}
                                            className="evidence-thumb"
                                            alt="evidence"
                                            onClick={() => setPreviewImage(`${API_BASE_URL.replace(/\/$/, '')}${detail.WastagePicture}`)}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '20px', color: '#ccc' }}>📷-</span>
                                    )}
                                </td>
                                <td>
                                    <strong>{detail.item?.ItemName}</strong>
                                    <br />
                                    <small style={{ color: '#888' }}>{detail.item?.unit?.UnitName}</small>
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{detail.Quantity}</td>
                                <td style={{ fontStyle: 'italic', color: '#666' }}>{detail.WastageReason}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="detail-action-bar">
                    {/* Admin Actions */}
                    {isAdmin && isPending && (
                        <button className="btn-approve" onClick={() => navigate(`/wastage/process/${id}`)}>
                            PROCESS REQUEST (Approve/Reject)
                        </button>
                    )}

                    {/* Owner/Admin Actions for Editing */}
                    {isPending && (
                        <>
                            {(() => {
                                const diffInHours = (new Date() - new Date(request.CreateAt)) / (1000 * 60 * 60);
                                const canManagerEdit = isOwner && diffInHours <= 72;
                                const canAdminEdit = isAdmin && diffInHours > 72;

                                return (canManagerEdit || canAdminEdit) ? (
                                    <button
                                        className="tab-item"
                                        style={{ background: '#007bff', color: 'white' }}
                                        onClick={() => navigate(`/wastage/edit/${id}`)}
                                    >
                                        EDIT REQUEST
                                    </button>
                                ) : null;
                            })()}

                            {isOwner && (
                                <button className="tab-item" style={{ background: '#6c757d', color: 'white' }} onClick={() => navigate(`/wastage/delete/${id}`)}>
                                    DELETE
                                </button>
                            )}
                        </>
                    )}

                    {!isPending && (
                        <p style={{ color: '#888' }}>This request has been finalized and cannot be modified.</p>
                    )}
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="img-modal" onClick={() => setPreviewImage(null)}>
                    <SafeImage src={previewImage} alt="Large evidence" />
                </div>
            )}
        </div>
    );
};

export default WastageDetail;
