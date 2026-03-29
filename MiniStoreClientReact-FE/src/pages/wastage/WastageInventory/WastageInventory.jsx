import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import wastageApi from "../../../api/wastage.api";
import branchApi from "../../../api/branch.api";
import { isFuzzyMatch } from "../../../helpers/search.helper";
import "./WastageInventory.css";

const WastageInventory = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [wastages, setWastages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    const fetchAllWastage = async () => {
        setLoading(true);
        try {
            const res = await wastageApi.getAll();
            setWastages(res.data.data || []);
        } catch (err) {
            console.error("Fetch Wastage API Error:", err);
            setWastages([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            setCurrentUser(user);

            // 1. Load branches if Admin
            if (user.RoleName === 'Admin') {
                const loadBranches = async () => {
                    try {
                        const res = await branchApi.getAll();
                        setBranches(res.data.data || res.data);
                    } catch (err) {
                        console.error("Fetch branches error:", err);
                    }
                };
                loadBranches();
            }
        }

        // 2. Fetch all wastage (accessible by all roles)
        fetchAllWastage();
    }, []);

    const filteredData = wastages.filter(item => {
        const statusName = item.status?.StatusName;
        const branchMatch = !selectedBranchId || item.BranchID === selectedBranchId;

        const statusMatch = activeTab === 'pending'
            ? statusName === 'Pending'
            : (statusName === 'Approved' || statusName === 'Rejected');

        // Search by ID or Manager Name
        const searchStr = `WASTAGE #${item.WastageID.substring(0, 8)} ${item.manager?.Username || ''}`;
        const searchMatch = isFuzzyMatch(searchStr, searchTerm);

        return statusMatch && branchMatch && searchMatch;
    });

    return (
        <div className="wastage-container">
            <div className="wastage-content-wrapper">
                <div className="wastage-header">
                    <h2 className="wastage-title">Wastage Management</h2>

                    <div className="wastage-filters">
                        {/* Search Box */}
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search by ID or Manager..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <span className="search-icon">🔍</span>
                        </div>

                        {/* Branch Filter for Admin */}
                        {currentUser?.RoleName === 'Admin' && (
                            <div className="branch-filter-container">
                                <span className="filter-label">Branch:</span>
                                <select
                                    value={selectedBranchId}
                                    onChange={(e) => setSelectedBranchId(e.target.value)}
                                    className="branch-select"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map(b => (
                                        <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="wastage-tabs">
                    <div
                        className={`wastage-tab-item ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Wastage Pending
                    </div>
                    <div
                        className={`wastage-tab-item ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Wastage History
                    </div>
                </div>

                <div className="wastage-list">
                    {loading ? (
                        <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading wastage data...</p>
                    ) : filteredData.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>No wastage records found.</p>
                    ) : (
                        filteredData.map(item => (
                            <div
                                key={item.WastageID}
                                className="wastage-card"
                                onClick={() => navigate(`/wastage/detail/${item.WastageID}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="wastage-info">
                                    <div className="wastage-card-header">
                                        <div className="wastage-id-group">
                                            <h4>WASTAGE #{item.WastageID.substring(0, 8).toUpperCase()}</h4>
                                            <span className={`wastage-status-tag wastage-status-${item.status?.StatusName.toLowerCase()}`}>
                                                {item.status?.StatusName}
                                            </span>
                                            <span className="wastage-branch-tag">
                                                📍 {item.branch?.BranchName || 'No Branch'}
                                            </span>
                                        </div>
                                    </div>
                                    <p>
                                        <strong>Created by:</strong> {item.manager?.Username || 'Unknown'}
                                        <span style={{ margin: '0 15px' }}>|</span>
                                        <strong>
                                            {activeTab === 'pending' ? 'Date:' : 'Processed:'}
                                        </strong> {new Date(activeTab === 'pending' ? item.CreateAt : (item.ApprovalDate || item.CreateAt)).toLocaleString()}
                                    </p>
                                </div>

                                {item.status?.StatusName === 'Pending' && currentUser?.UserID === item.RequesterID && (
                                    <div className="wastage-actions">
                                        <button
                                            className="wastage-btn-icon"
                                            title="Edit/View"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/wastage/edit/${item.WastageID}`);
                                            }}
                                        >
                                            📝
                                        </button>
                                        <button
                                            className="wastage-btn-icon"
                                            title="Delete"
                                            style={{ color: '#dc3545' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/wastage/delete/${item.WastageID}`);
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <button
                    className="btn-create-wastage-floating"
                    onClick={() => navigate('/wastage/create')}
                >
                    Create Wastage
                </button>
            </div>
        </div>
    );
};

export default WastageInventory;
