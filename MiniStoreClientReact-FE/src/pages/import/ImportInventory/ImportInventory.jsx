import { useEffect, useState } from "react"
import importApi from "../../../api/import.api";
import branchApi from "../../../api/branch.api";
import { isFuzzyMatch } from "../../../helpers/search.helper";
import "./ImportInventory.css";
import { useNavigate } from "react-router-dom";

const ImportInventory = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [imports, setImports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); // Thêm state search
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    // ... (useEffect and fetchAll remain same logic, but let's update them)

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        setCurrentUser(user);

        const loadBranches = async () => {
            if (user?.RoleName === 'Admin') {
                try {
                    const res = await branchApi.getAll();
                    setBranches(res.data.data || res.data);
                } catch (err) {
                    console.error("Fetch branches error:", err);
                }
            }
        };
        loadBranches();
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await importApi.getAll();
            setImports(res.data.data || []);
        } catch (err) {
            console.error("Fetch API Error:", err);
            setImports([]);
        } finally {
            setLoading(false);
        }
    };

    // Logic Filtering by Status, Branch AND Search
    const filteredData = imports.filter(item => {
        const statusName = item.status?.StatusName;
        const branchMatch = !selectedBranchId || item.BranchID === selectedBranchId;

        const statusMatch = activeTab === 'pending'
            ? statusName === 'Pending'
            : (statusName === 'Approved' || statusName === 'Rejected');

        // Search by ID or Manager Name
        const searchStr = `ORDER #${item.RequestID.substring(0, 8)} ${item.manager?.Username || ''}`;
        const searchMatch = isFuzzyMatch(searchStr, searchTerm);

        return statusMatch && branchMatch && searchMatch;
    });

    return (
        <div className="import-container">
            <div className="import-content-wrapper">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <h2 style={{ margin: 0 }}>Import Management</h2>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {/* Search Box */}
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search by ID or Manager..."
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
                                    width: '220px'
                                }}
                            />
                            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                        </div>

                        {/* Branch Filter for Admin */}
                        {currentUser?.RoleName === 'Admin' && (
                            <select
                                value={selectedBranchId}
                                onChange={(e) => setSelectedBranchId(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-main)',
                                    fontSize: '13px',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">-- All Branches --</option>
                                {branches.map(b => (
                                    <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <div className="import-tabs">
                    <div
                        className={`tab-item ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Import Pending
                    </div>
                    <div
                        className={`tab-item ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Import History
                    </div>
                </div>

                <div className="import-list">
                    {loading ? (
                        <p style={{ textAlign: 'center', marginTop: '50px' }}>Data Loading...</p>
                    ) : filteredData.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>No records found.</p>
                    ) : filteredData.map(item => (
                        <div
                            key={item.RequestID}
                            className="import-card"
                            onClick={() => navigate(`/import/detail/${item.RequestID}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="import-info">
                                <div className="import-card-header">
                                    <div className="import-id-group">
                                        <h4>ORDER #{item.RequestID.substring(0, 8).toUpperCase()}</h4>
                                        <span className={`status-tag status-${item.status?.StatusName.toLowerCase()}`}>
                                            {item.status?.StatusName}
                                        </span>
                                        <span className="branch-tag">
                                            📍 {item.branch?.BranchName || 'No Branch'}
                                        </span>
                                    </div>
                                </div>
                                <p>
                                    <strong>Created by:</strong> {item.manager?.Username || 'System'}
                                    <span style={{ margin: '0 15px' }}>|</span>
                                    <strong>
                                        {activeTab === 'pending' ? 'Date:' : 'Processed:'}
                                    </strong> {new Date(activeTab === 'pending' ? item.CreateAt : (item.ApprovalDate || item.CreateAt)).toLocaleString()}
                                </p>
                            </div>
                            {item.status?.StatusName === 'Pending' && currentUser?.UserID === item.ManagerID && (
                                <div className="import-actions">
                                    <button
                                        className="btn-icon"
                                        title="Edit/View"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/import/edit/${item.RequestID}`);
                                        }}
                                    >
                                        📝
                                    </button>
                                    <button
                                        className="btn-icon"
                                        title="Delete"
                                        style={{ color: '#dc3545' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/import/delete/${item.RequestID}`);
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    className="btn-create-floating"
                    onClick={() => navigate('/import/create')}
                >
                    Create Import
                </button>
            </div>
        </div >
    );
};

export default ImportInventory;
