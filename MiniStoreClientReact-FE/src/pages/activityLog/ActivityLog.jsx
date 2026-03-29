import React, { useEffect, useState } from 'react';
import activityLogApi from '../../api/activityLog.api';
import { isFuzzyMatch } from '../../helpers/search.helper';
import './ActivityLog.css';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        setCurrentUser(user);
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await activityLogApi.getAllLogs();
            setLogs(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch activity logs:", error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    // Helper to get a nice badge color for the module
    const getModuleBadgeClass = (moduleName) => {
        if (!moduleName) return 'log-module-other';
        const normalized = moduleName.toLowerCase().replace(/\s+/g, '');
        if (normalized.includes('purchaserequest')) return 'log-module-purchaserequests';
        if (normalized.includes('wastage')) return 'log-module-wastage';
        if (normalized.includes('internaltransfer')) return 'log-module-internaltransfers';
        if (normalized.includes('foodformula')) return 'log-module-foodformulas';
        return 'log-module-other';
    };

    // Helper to format the module name nicely
    const formatModuleName = (moduleName) => {
        if (!moduleName) return 'System';
        switch (moduleName) {
            case 'PurchaseRequests': return 'Purchase Request';
            case 'WastageRequests': return 'Wastage Request';
            case 'InternalTransfers': return 'Internal Transfer';
            case 'FoodFormulas': return 'Food Formula';
            default: return moduleName;
        }
    };

    const filteredLogs = logs.filter(log => {
        if (!searchTerm) return true;
        const searchStr = `
            ${log.LogID} 
            ${log.User?.Username || ''} 
            ${log.ActionType} 
            ${log.ReferenceEntityName} 
            ${log.Description}
            ${log.RelatedBranches?.map(b => b.BranchName).join(' ')}
        `.toLowerCase();

        return isFuzzyMatch(searchStr, searchTerm);
    });

    return (
        <div className="activity-log-container">
            <div className="activity-log-wrapper">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                    <h2 style={{ margin: 0 }}>
                        <span style={{ marginRight: '10px' }}>📋</span>
                        System Activity Logs
                    </h2>

                    <div className="activity-search-bar">
                        <input
                            type="text"
                            className="activity-search-input"
                            placeholder="Search logs by action, user, or branch..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="activity-search-icon">🔍</span>
                    </div>
                </div>

                <div className="activity-table-container">
                    <table className="activity-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Module & Action</th>
                                <th>User</th>
                                <th>Description & Branches</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>Loading activity logs...</td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No activity records found matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.LogID}>
                                        <td style={{ width: '15%' }}>
                                            <div className="log-time">
                                                {new Date(log.Timestamp).toLocaleString()}
                                            </div>
                                        </td>
                                        <td style={{ width: '25%' }}>
                                            <div style={{ marginBottom: '6px' }}>
                                                <span className={`log-module-badge ${getModuleBadgeClass(log.ReferenceEntityName)}`}>
                                                    {formatModuleName(log.ReferenceEntityName)}
                                                </span>
                                            </div>
                                            <div style={{ fontWeight: 'bold' }}>{log.ActionType}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '4px' }}>
                                                ID: {String(log.ReferenceEntityID).substring(0, 8)}...
                                            </div>
                                        </td>
                                        <td style={{ width: '15%' }}>
                                            <div className="log-user">
                                                {log.User ? log.User.Username : 'System'}
                                            </div>
                                            {log.User && log.User.FullName && (
                                                <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                                                    {log.User.FullName}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ width: '45%' }}>
                                            <div className="log-desc" style={{ marginBottom: log.RelatedBranches?.length > 0 ? '10px' : '0' }}>
                                                {log.Description || <i>No description provided</i>}
                                            </div>

                                            {log.RelatedBranches && log.RelatedBranches.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {log.RelatedBranches.map((branchInfo, idx) => (
                                                        <div key={idx} className="log-branch-tag">
                                                            <span className={`log-role-${branchInfo.RoleInAction?.toLowerCase() || 'affected'}`}>
                                                                {branchInfo.RoleInAction}:
                                                            </span>
                                                            &nbsp;{branchInfo.BranchName || branchInfo.BranchID}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActivityLog;
