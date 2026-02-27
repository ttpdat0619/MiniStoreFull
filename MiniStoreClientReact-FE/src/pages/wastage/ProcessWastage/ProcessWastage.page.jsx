import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import wastageApi from '../../../api/wastage.api';
import './ProcessWastage.page.css';

const ProcessWastage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState('Approved'); // Default to Approved
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await wastageApi.getDetail(id);
                setRequest(res.data.data);
            } catch (err) {
                console.error("Fetch Error:", err);
                alert("Cannot load request detail!");
                navigate('/wastage');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate]);

    const handleSubmit = async () => {
        if (action === 'Rejected' && reason.trim().length < 5) {
            return alert("Please provide a valid reason for rejection (min 5 characters).");
        }

        setProcessing(true);
        try {
            await wastageApi.processWastage(id, {
                action: action,
                reason: reason
            });
            alert(`Wastage Request has been ${action.toLowerCase()} successfully!`);
            navigate(`/wastage/detail/${id}`);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to process request.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="process-wastage-container"><p>Loading...</p></div>;

    return (
        <div className="process-wastage-container">
            <div className="process-wastage-card">
                <button className="btn-back-simple" onClick={() => navigate(-1)}>← CANCEL & RETURN</button>

                <h2 className="process-title">Decision: Process Wastage #{id.substring(0, 8)}</h2>
                <p className="process-subtitle">Review the details and provide your final decision.</p>

                <div className="summary-section">
                    <div className="summary-header">
                        <p><strong>Requester:</strong> {request?.manager?.Username}</p>
                        <p><strong>Total Items:</strong> {request?.details?.length}</p>
                    </div>

                    <div className="process-item-preview">
                        <table className="mini-item-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {request?.details?.map((detail) => (
                                    <tr key={detail.DetailID}>
                                        <td>{detail.item?.ItemName}</td>
                                        <td>{detail.Quantity}</td>
                                        <td>{detail.item?.unit?.UnitName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="decision-section">
                    <label className="decision-label">SELECT ACTION</label>
                    <div className="decision-options">
                        <label className={`option-card ${action === 'Approved' ? 'active approve' : ''}`}>
                            <input
                                type="radio"
                                name="action"
                                value="Approved"
                                checked={action === 'Approved'}
                                onChange={(e) => setAction(e.target.value)}
                            />
                            <span className="radio-custom"></span>
                            <div className="option-text">
                                <strong>APPROVE</strong>
                                <small>Deduct items from stock inventory</small>
                            </div>
                        </label>

                        <label className={`option-card ${action === 'Rejected' ? 'active reject' : ''}`}>
                            <input
                                type="radio"
                                name="action"
                                value="Rejected"
                                checked={action === 'Rejected'}
                                onChange={(e) => setAction(e.target.value)}
                            />
                            <span className="radio-custom"></span>
                            <div className="option-text">
                                <strong>REJECT</strong>
                                <small>Disapprove this wastage request</small>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="reason-section">
                    <label className="decision-label">
                        {action === 'Rejected' ? 'REJECTION REASON (REQUIRED)' : 'ADDITIONAL NOTES (OPTIONAL)'}
                    </label>
                    <textarea
                        className="reason-textarea"
                        placeholder={action === 'Rejected' ? "Explain why you are rejecting this request..." : "Add any notes for the requester..."}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                    />
                </div>

                <div className="process-footer">
                    <button
                        className={`btn-confirm-process ${action.toLowerCase()}`}
                        onClick={handleSubmit}
                        disabled={processing}
                    >
                        {processing ? "PROCESSING..." : `CONFIRM ${action.toUpperCase()}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProcessWastage;
