import React, { useState, useEffect, useRef } from 'react';
import { isFuzzyMatch } from '../../helpers/search.helper';

const SearchableSelect = ({ items, value, onChange, excludedIds = [], placeholder = "-- Select Product --" }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Tìm sản phẩm đang được chọn để hiển thị tên lên ô input
    const selectedItem = items.find(i => i.ItemID === value);

    // Filter sản phẩm dựa trên fuzzy matching và exclude những cái đã chọn ở hàng khác
    const filteredItems = items.filter(item => {
        // 1. Kiểm tra fuzzy match
        const matchesSearch = isFuzzyMatch(item.ItemName, searchTerm);

        // 2. Kiểm tra xem có bị exclude không (trừ chính nó đang được chọn ở ô này)
        const isExcluded = excludedIds.includes(item.ItemID) && item.ItemID !== value;

        return matchesSearch && !isExcluded;
    });

    // Xử lý click ra ngoài thì đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (item) => {
        onChange(item.ItemID);
        setSearchTerm('');
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
            {/* Ô hiển thị chính */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '8px 10px',
                    borderRadius: '4px',
                    background: 'var(--bg-main)',
                    color: selectedItem ? 'var(--text-main)' : '#888',
                    border: '1px solid var(--border-color)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '36px',
                    boxSizing: 'border-box'
                }}
            >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'bold' }}>
                    {selectedItem ? selectedItem.ItemName : placeholder}
                </span>
                <span style={{ fontSize: '10px', marginLeft: '5px' }}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    background: 'var(--bg-card)',
                    border: '1px solid #007bff',
                    borderRadius: '4px',
                    marginTop: '5px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    maxHeight: '250px',
                    overflowY: 'auto'
                }}>
                    {/* Ô nhập tìm kiếm bên trong dropdown */}
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search product (typing...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: 'none',
                            borderBottom: '1px solid var(--border-color)',
                            background: 'var(--bg-main)',
                            color: 'var(--text-main)',
                            outline: 'none',
                            boxSizing: 'border-box',
                            position: 'sticky',
                            top: 0
                        }}
                    />
                    {/* Danh sách kết quả */}
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <div
                                key={item.ItemID}
                                onClick={() => handleSelect(item)}
                                className="search-item-option"
                                style={{
                                    padding: '10px 15px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    color: 'var(--text-main)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong style={{ fontWeight: 'bold', color: '#007bff' }}>{item.ItemName}</strong>
                                    <span style={{
                                        fontSize: '11px',
                                        background: 'rgba(0,123,255,0.1)',
                                        color: '#007bff',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        fontWeight: 'bold'
                                    }}>
                                        {item.unit?.UnitName || 'pc'}
                                    </span>
                                </div>
                                {item.Description && (
                                    <span style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.Description}
                                    </span>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '10px', color: '#888', fontSize: '12px', textAlign: 'center' }}>
                            No items found 😅
                        </div>
                    )}
                </div>
            )}
            <style>{`
                .search-item-option:hover { 
                    background: #007bff !important; 
                }
                .search-item-option:hover strong,
                .search-item-option:hover span {
                    color: white !important;
                }
                .search-item-option:hover .unit-badge {
                    background: rgba(255, 255, 255, 0.2) !important;
                }
            `}</style>
        </div>
    );
};

export default SearchableSelect;