import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import importApi from '../../api/import.api';
import './import.Page.css';



const ImportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);


    useEffect(() => {
        // Lấy User hiện tại từ localStorage
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
                // Đề phòng ID bị lỗi dấu cách trong URL
                const cleanId = id?.replaceAll(' ', '-');
                const res = await importApi.getDetail(cleanId);
                console.log("Detail Data Received:", res.data); // Log để check data
                setRequest(res.data.data);
            } catch (err) {
                console.error("Fetch Detail Error:", err);
                alert(err.response?.data?.message || "Cannot load request detail!");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div className="import-container"><p style={{ textAlign: 'center', marginTop: '50px' }}>Loading detail...</p></div>;

    // Nếu không thấy request hoặc data lỗi, show lỗi thay vì trắng trang
    if (!request || typeof request !== 'object') {
        return (
            <div className="import-container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <button className="btn-back" onClick={() => navigate('/import')}>← BACK</button>
                <div style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-card)', borderRadius: '8px' }}>
                    <h3>⚠️ Request Not Found!</h3>
                    <p style={{ color: '#888' }}>ID: {id}</p>
                    <p>Hệ thống không tìm thấy đơn hàng này hoặc có lỗi xảy ra.</p>
                </div>
            </div>
        );
    }

    const isActualOwner = currentUser?.UserID === request.ManagerID;
    const isAdmin = currentUser?.RoleName === 'Admin';
    const isPending = request.status?.StatusName === 'Pending';

    return (
        <div className="import-container">
            <div className="import-content-wrapper detail-page">
                <button className="btn-back" onClick={() => navigate('/import')}>← BACK TO LIST</button>

                <div className="detail-header" style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ margin: 0 }}>ORDER #{String(request.RequestID || id).substring(0, 8).toUpperCase()}</h2>
                            <p style={{ color: 'var(--text-sub)', fontSize: '13px', margin: '5px 0' }}>Created on: {request.CreateAt ? new Date(request.CreateAt).toLocaleString() : '---'}</p>
                            {request.ApprovalDate && !isPending && (
                                <p style={{ color: '#28a745', fontSize: '13px', margin: '5px 0', fontWeight: 'bold' }}>
                                    Processed on: {new Date(request.ApprovalDate).toLocaleString()}
                                </p>
                            )}
                        </div>
                        <span className={`status-tag status-${request.status?.StatusName.toLowerCase()}`} style={{ fontSize: '16px', padding: '8px 20px' }}>
                            {request.status?.StatusName}
                        </span>
                    </div>
                </div>

                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '30px 0' }}>
                    <div className="detail-section card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px', color: '#007bff' }}>PERSONNEL</h4>
                        <p><strong>Created by:</strong> {request.manager?.Username} ({request.manager?.RoleName})</p>
                        <p><strong>Approved by:</strong> {request.approver?.Username || '---'}</p>
                        {request.RejectionReason && (
                            <p style={{ color: '#dc3545' }}><strong>Reason:</strong> {request.RejectionReason}</p>
                        )}
                    </div>

                    <div className="detail-section card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px', color: '#007bff' }}>SUMMARY</h4>
                        <p><strong>Total Items:</strong> {request.details?.length}</p>
                        <p><strong>Request ID:</strong> <small>{request.RequestID}</small></p>
                    </div>
                </div>

                <div className="item-table-container">
                    <h4 style={{ marginBottom: '15px' }}>ORDERED ITEMS</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-card)', borderRadius: '8px', overflow: 'hidden' }}>
                        <thead style={{ background: 'rgba(0,123,255,0.1)', color: '#007bff' }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Item Name</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Unit</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Quantity</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Total (Pieces)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {request.details?.map((detail, idx) => (
                                <tr key={detail.DetailID} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px' }}>{idx + 1}</td>
                                    <td style={{ padding: '12px' }}>
                                        <strong>{detail.item?.ItemName}</strong>
                                        <br /><small style={{ color: '#888' }}>{detail.item?.Description}</small>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>{detail.item?.unit?.UnitName}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>{detail.Quantity}</td>
                                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#007bff' }}>
                                        {Number(detail.Quantity) * Number(detail.item?.Quantity || 1)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ACTION BUTTONS */}
                <div className="detail-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '40px' }}>

                    {/* Nút XỬ LÝ (Duyệt/Từ chối) dành cho Admin */}
                    {isAdmin && isPending && (
                        <button
                            className="tab-item active"
                            style={{ background: '#28a745', border: 'none', padding: '12px 40px', fontSize: '15px' }}
                            onClick={() => navigate(`/import/approve/${id}`)}
                        >
                            PROCESS ORDER (APPROVE/REJECT)
                        </button>
                    )}

                    {/* 
                         LOGIC:
                         - Manager được SỬA đơn của chính mình trong vòng 3 ngày.
                         - Admin được SỬA đơn khi đơn đó đã quá 3 ngày (Manager hết quyền sửa).
                         - Cả hai trường hợp đều phải ở trạng thái Pending.
                    */}
                    {(() => {
                        const diffInDays = (new Date() - new Date(request.CreateAt)) / (1000 * 60 * 60 * 24);
                        const canManagerEdit = isActualOwner && isPending && diffInDays <= 3;
                        const canAdminEdit = isAdmin && isPending && diffInDays > 3;
                        const canManagerDelete = isActualOwner && isPending && diffInDays <= 2;

                        return (
                            <>
                                {(canManagerEdit || canAdminEdit) && (
                                    <button
                                        className="tab-item"
                                        style={{ background: '#007bff', color: 'white', padding: '12px 30px' }}
                                        onClick={() => navigate(`/import/edit/${id}`)}
                                    >
                                        EDIT REQUEST
                                    </button>
                                )}

                                {canManagerDelete && (
                                    <button
                                        className="tab-item"
                                        style={{ background: '#dc3545', color: 'white', padding: '12px 30px' }}
                                        onClick={() => navigate(`/import/delete/${id}`)}
                                    >
                                        DELETE
                                    </button>
                                )}
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

export default ImportDetail;
