import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import transferApi from '../../../api/transfer.api';
import './TransferDetail.css';

const TransferDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transfer, setTransfer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [actionNote, setActionNote] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }

        const fetchDetail = async () => {
            try {
                const cleanId = id?.replaceAll(' ', '-');
                const res = await transferApi.getById(cleanId);
                setTransfer(res.data);
            } catch (err) {
                console.error("Fetch Detail Error:", err);
                alert(err.response?.data?.message || "Cannot load transfer detail!");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div className="transfer-container"><p style={{ textAlign: 'center', marginTop: '50px' }}>Loading detail...</p></div>;

    if (!transfer || typeof transfer !== 'object') {
        return (
            <div className="transfer-container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <button className="btn-back" onClick={() => navigate('/transfer')}>← BACK</button>
                <div style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-card)', borderRadius: '8px' }}>
                    <h3>⚠️ Transfer Request Not Found!</h3>
                    <p style={{ color: '#888' }}>ID: {id}</p>
                </div>
            </div>
        );
    }

    // Role checks
    const isAdmin = currentUser?.RoleName === 'Admin';
    const isTargetManager = currentUser?.RoleName === 'Manager' && currentUser?.BranchID === transfer.ToBranchID;

    // Status checks
    const isReceiverPending = transfer.receiveStatus?.StatusName === 'Pending';
    const isAdminPending = transfer.approvalStatus?.StatusName === 'Pending';
    const isReceiverApproved = transfer.receiveStatus?.StatusName === 'Approved';

    // Action Handlers
    const handleRespond = async (action) => {
        if (!window.confirm(`Are you sure you want to ${action} this transfer?`)) return;
        try {
            await transferApi.respond(transfer.TransferID, action, actionNote);
            alert(`Transfer ${action} successfully!`);
            navigate('/transfer');
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${action} transfer.`);
        }
    };

    const handleApprove = async (action) => {
        if (!window.confirm(`Are you sure you want to ${action} this transfer? This will affect inventory stock.`)) return;
        try {
            await transferApi.approve(transfer.TransferID, action, actionNote);
            alert(`Transfer ${action} successfully!`);
            navigate('/transfer');
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${action} transfer.`);
        }
    };

    return (
        <div className="transfer-container">
            <div className="transfer-content-wrapper detail-page">
                <button className="btn-back" onClick={() => navigate('/transfer')}>← BACK TO LIST</button>

                <div className="detail-header" style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <h2 style={{ margin: 0 }}>TRF #{String(transfer.TransferID || id).substring(0, 8).toUpperCase()}</h2>
                            </div>
                            <p style={{ color: 'var(--text-sub)', fontSize: '13px', margin: '10px 0' }}>
                                Requested on: {transfer.SentDate ? new Date(transfer.SentDate).toLocaleString() : '---'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span className={`status-tag status-${transfer.receiveStatus?.StatusName.toLowerCase()}`} style={{ fontSize: '13px' }}>
                                Target Branch: {transfer.receiveStatus?.StatusName}
                            </span>
                            <span className={`status-tag status-${transfer.approvalStatus?.StatusName?.toLowerCase() || 'pending'}`} style={{ fontSize: '13px' }}>
                                Admin: {transfer.approvalStatus?.StatusName || 'Pending'}
                            </span>
                            {isReceiverPending && isAdminPending && (
                                <button
                                    onClick={() => navigate(`/transfer/edit/${transfer.TransferID}`)}
                                    style={{
                                        background: '#ffc107',
                                        color: '#212529',
                                        border: 'none',
                                        padding: '6px 18px',
                                        borderRadius: '20px',
                                        fontWeight: 'bold',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        marginTop: '5px'
                                    }}
                                >
                                    ✏️ EDIT REQUEST
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', margin: '30px 0' }}>
                    {/* Source Info */}
                    <div className="detail-section card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px', color: '#007bff' }}>MOUVEMENT: FROM</h4>
                        <p><strong>Branch:</strong> {transfer.fromBranch?.BranchName}</p>
                        <p><strong>Sender:</strong> {transfer.sender?.Username} ({transfer.sender?.FullName})</p>
                        <p><strong>Note:</strong> {transfer.SendNote || <i>No note provided</i>}</p>
                    </div>

                    {/* Target Info */}
                    <div className="detail-section card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px', color: '#28a745' }}>MOUVEMENT: TO</h4>
                        <p><strong>Branch:</strong> {transfer.toBranch?.BranchName}</p>
                        <p><strong>Receiver (Manager):</strong> {transfer.receiver?.Username || 'Pending...'}</p>
                        <p><strong>Response Date:</strong> {transfer.ReceivedDate ? new Date(transfer.ReceivedDate).toLocaleString() : 'Pending...'}</p>
                        <p><strong>Receiver Note:</strong> {transfer.ReceivedNote || <i>No note provided</i>}</p>
                    </div>

                    {/* Admin Status */}
                    <div className="detail-section card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px', color: '#6f42c1' }}>FINAL APPROVAL (ADMIN)</h4>
                        <p><strong>Approver:</strong> {transfer.approver?.Username || 'Pending...'}</p>
                        <p><strong>Approval Date:</strong> {transfer.ApprovedDate ? new Date(transfer.ApprovedDate).toLocaleString() : 'Pending...'}</p>
                        <p><strong>Admin Note:</strong> {transfer.AdminNote || <i>No note provided</i>}</p>
                    </div>
                </div>

                <div className="item-table-container">
                    <h4 style={{ marginBottom: '15px' }}>ITEMS TO TRANSFER</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-card)', borderRadius: '8px', overflow: 'hidden' }}>
                        <thead style={{ background: 'rgba(0,123,255,0.1)', color: '#007bff' }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Item Name</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Unit</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Total Pieces Transferring</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfer.details?.map((detail, idx) => (
                                <tr key={detail.DetailID} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px' }}>{idx + 1}</td>
                                    <td style={{ padding: '12px' }}>
                                        <strong>{detail.item?.ItemName}</strong>
                                        <br /><small style={{ color: '#888' }}>{detail.item?.Description}</small>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>{detail.item?.unit?.UnitName}</td>
                                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#007bff' }}>
                                        {Number(detail.Quantity) * Number(detail.item?.Quantity || 1)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ACTION FORMS based on role and status */}

                {/* Case 1: Target Manager needs to respond (Manager can respond regardless of Admin status) */}
                {isTargetManager && isReceiverPending && (
                    <div className="action-form">
                        <h4 style={{ color: '#007bff' }}>DESTINATION MANAGER RESPONSE</h4>
                        <p style={{ color: 'var(--text-sub)', marginBottom: '15px', fontSize: '13px' }}>
                            {isAdminPending
                                ? "Please verify if your branch can accept this incoming stock transfer before proceeding."
                                : "Admin already approved. Accepting this transfer will immediately execute the stock movement."
                            }
                        </p>
                        <textarea
                            className="action-note-input"
                            placeholder="Add a note to your response (optional)..."
                            value={actionNote}
                            onChange={(e) => setActionNote(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'flex-start' }}>
                            <button className="btn-process btn-approve" onClick={() => handleRespond('Approved')}>
                                {isAdminPending ? 'ACCEPT TRANSFER' : 'FINALIZE (EXECUTE TRANSFER)'}
                            </button>
                            <button className="btn-process btn-reject" onClick={() => handleRespond('Rejected')}>
                                REJECT TRANSFER
                            </button>
                        </div>
                    </div>
                )}

                {/* Case 2: Admin approval (Admin can approve/reject regardless of receiver status) */}
                {isAdmin && isAdminPending && (
                    <div className="action-form">
                        <h4 style={{ color: '#6f42c1' }}>ADMIN APPROVAL</h4>
                        <p style={{ color: 'var(--text-sub)', marginBottom: '15px', fontSize: '13px' }}>
                            {isReceiverApproved
                                ? "Both parties approved. Approving will immediately execute the stock transfer."
                                : "Destination branch has not responded yet. Stock transfer will execute once both parties approve."
                            }
                        </p>
                        <textarea
                            className="action-note-input"
                            placeholder="Add an admin note (optional)..."
                            value={actionNote}
                            onChange={(e) => setActionNote(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'flex-start' }}>
                            <button className="btn-process btn-approve" onClick={() => handleApprove('Approved')}>
                                {isReceiverApproved ? 'FINALIZE (EXECUTE TRANSFER)' : 'APPROVE'}
                            </button>
                            <button className="btn-process btn-reject" onClick={() => handleApprove('Rejected')}>
                                REJECT TRANSFER
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransferDetail;
