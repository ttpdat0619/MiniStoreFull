import { useEffect, useState } from "react"
import importApi from "../../api/import.api";
import "./import.Page.css";
import { useNavigate } from "react-router-dom";

const currentUser = JSON.parse(localStorage.getItem('currentUser'));

const ImportInventory = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [imports, setImports] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    useEffect(() => {
        fetchAll();
    }, []);

    //Logic Fillter by Status
    const filteredData = imports.filter(item => {
        const statusName = item.status?.StatusName;
        if (activeTab === 'pending') return statusName === 'Pending';
        return statusName === 'Approved' || statusName === 'Rejected';
    });

    return (
        <div className="import-container">
            <div className="import-content-wrapper">
                <h2 style={{ marginBottom: '20px' }}>Import Management</h2>
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
                                <h4>
                                    ORDER #{item.RequestID.substring(0, 8).toUpperCase()}
                                    <span className={`status-tag status-${item.status?.StatusName.toLowerCase()}`}>
                                        {item.status?.StatusName}
                                    </span>
                                </h4>
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
                                            // Chuyển thẳng đến trang Edit thay vì Detail
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
                                            // Chuyển đến trang xác nhận xóa
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