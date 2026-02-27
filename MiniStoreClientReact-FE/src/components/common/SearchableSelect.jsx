import React, { useState, useEffect, useRef } from 'react';

const SearchableSelect = ({ items, value, onChange, placeholder = "-- Select Product --" }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Tìm sản phẩm đang được chọn để hiển thị tên lên ô input
    const selectedItem = items.find(i => i.ItemID === value);

    // --- LINH HỒN CỦA THỬ THÁCH: HÀM XỬ LÝ CHUỖI ---
    const removeAccents = (str) => {
        if (!str) return "";
        return str.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Tách dấu ra khỏi chữ và xóa đi
            .replace(/đ/g, "d").replace(/Đ/g, "D"); // Xử lý riêng chữ đ
    };

    // Hàm tìm kiếm gần đúng (Fuzzy Match - Subsequence)
    const fuzzyMatch = (query, target) => {
        query = removeAccents(query.toLowerCase());
        target = removeAccents(target.toLowerCase());

        let i = 0, j = 0;
        while (i < query.length && j < target.length) {
            if (query[i] === target[j]) i++;
            j++;
        }
        return i === query.length;
    };

    // Filter sản phẩm dựa trên fuzzy matching
    const filteredItems = items.filter(item => fuzzyMatch(searchTerm, item.ItemName));

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
                                    padding: '10px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    color: 'var(--text-main)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                }}
                            >
                                <strong style={{ fontWeight: 'bold' }}>{item.ItemName}</strong>
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
                    color: white !important; 
                }
            `}</style>
        </div>
    );
};

export default SearchableSelect;