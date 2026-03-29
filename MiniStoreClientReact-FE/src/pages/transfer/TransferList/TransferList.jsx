import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import transferApi from "../../../api/transfer.api";
import { isFuzzyMatch } from "../../../helpers/search.helper";
import "./TransferList.css";

const TransferList = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        setCurrentUser(user);
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await transferApi.getAll();
            setTransfers(res.data || []);
        } catch (err) {
            console.error("Fetch API Error:", err);
            setTransfers([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = transfers.filter(item => {
        // Pending = at least one side is still Pending AND neither side has Rejected
        const adminStatus = item.approvalStatus?.StatusName || 'Pending';
        const receiveStatus = item.receiveStatus?.StatusName || 'Pending';
        const isRejected = adminStatus === 'Rejected' || receiveStatus === 'Rejected';
        const isBothResponded = adminStatus !== 'Pending' && receiveStatus !== 'Pending';
        const isHistory = isRejected || isBothResponded;

        const tabMatch = activeTab === 'pending' ? !isHistory : isHistory;

        // Search by ID or Sender Username
        const searchStr = `TRF #${item.TransferID.substring(0, 8)} ${item.sender?.Username || ''} ${item.fromBranch?.BranchName || ''} ${item.toBranch?.BranchName || ''}`;
        const searchMatch = isFuzzyMatch(searchStr, searchTerm);

        return tabMatch && searchMatch;
    });

    return (
        <div className="transfer-container">
            <div className="transfer-content-wrapper">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <h2 style={{ margin: 0 }}>Internal Stock Transfers</h2>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {/* Search Box */}
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search transfers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: '8px 15px',
                                    paddingRight: '35px',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-main)',
                                    fontSize: '13px',
                                    outline: 'none',
                                    width: '250px'
                                }}
                            />
                            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                        </div>
                    </div>
                </div>

                <div className="transfer-tabs">
                    <div
                        className={`tab-item ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending Requests
                    </div>
                    <div
                        className={`tab-item ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Transfer History
                    </div>
                </div>

                <div className="transfer-list">
                    {loading ? (
                        <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading transfers...</p>
                    ) : filteredData.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>No records found.</p>
                    ) : filteredData.map(item => (
                        <div
                            key={item.TransferID}
                            className="transfer-card"
                            onClick={() => navigate(`/transfer/detail/${item.TransferID}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="transfer-info">
                                <div className="transfer-card-header">
                                    <div className="transfer-id-group">
                                        <h4>TRF #{item.TransferID.substring(0, 8).toUpperCase()}</h4>
                                        <span className={`status-tag status-${item.approvalStatus?.StatusName?.toLowerCase() || 'pending'}`}>
                                            Admin: {item.approvalStatus?.StatusName || 'Pending'}
                                        </span>
                                        <span className={`status-tag status-${item.receiveStatus?.StatusName?.toLowerCase() || 'pending'}`}>
                                            Receive: {item.receiveStatus?.StatusName || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                                <p style={{ marginTop: '10px' }}>
                                    <span className="branch-tag" style={{ marginRight: '10px' }}>
                                        📤 From: {item.fromBranch?.BranchName || 'Unknown'}
                                    </span>
                                    {' ➔ '}
                                    <span className="branch-tag" style={{ marginLeft: '10px' }}>
                                        📥 To: {item.toBranch?.BranchName || 'Unknown'}
                                    </span>
                                </p>
                                <p style={{ marginTop: '10px' }}>
                                    <strong>Requested by:</strong> {item.sender?.Username || 'System'}
                                    <span style={{ margin: '0 15px' }}>|</span>
                                    <strong>Date:</strong> {new Date(item.SentDate).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create btn for Manager/Admin */}
                {(currentUser?.RoleName === 'Manager' || currentUser?.RoleName === 'Admin') && (
                    <button
                        className="btn-create-floating"
                        onClick={() => navigate('/transfer/create')}
                    >
                        + Create Transfer
                    </button>
                )}
            </div>
        </div>
    );
};

export default TransferList;
