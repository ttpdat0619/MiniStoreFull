import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import wastageApi from "../../../api/wastage.api";
import "./WastageInventory.page.css";

const currentUser = JSON.parse(localStorage.getItem('currentUser'));

const WastageInventory = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [wastages, setWastages] = useState([]);
    const [loading, setLoading] = useState(true);
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
        fetchAllWastage();
    }, []);

    const filteredData = wastages.filter(item => {
        const statusName = item.status?.StatusName;
        if (activeTab === 'pending') return statusName === 'Pending';
        return statusName === 'Approved' || statusName === 'Rejected';
    });

    return (
        <div className="wastage-container">
            <div className="wastage-content-wrapper">
                <h2 style={{ marginBottom: '20px' }}>Wastage Management</h2>

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
                                    <h4>
                                        WASTAGE #{item.WastageID.substring(0, 8).toUpperCase()}
                                        <span className={`wastage-status-tag wastage-status-${item.status?.StatusName.toLowerCase()}`}>
                                            {item.status?.StatusName}
                                        </span>
                                    </h4>
                                    <p>
                                        <strong>Created by:</strong> {item.manager?.Username || 'Unknown'}
                                        <span style={{ margin: '0 15px' }}>|</span>
                                        <strong>
                                            {activeTab === 'pending' ? 'Date:' : 'Processed:'}
                                        </strong> {new Date(activeTab === 'pending' ? item.CreateAt : (item.ApprovalDate || item.CreateAt)).toLocaleString()}
                                    </p>
                                </div>

                                {item.status?.StatusName === 'Pending' && currentUser?.UserID === item.ManagerID && (
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
