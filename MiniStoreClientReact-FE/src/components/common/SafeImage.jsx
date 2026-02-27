import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getDomain } from '../../api/axiosClient';

/**
 * Component "Khôn lõi" để load ảnh qua Ngrok mà không bị dính trang cảnh báo.
 * Nó dùng Axios để tải ảnh (với header skip-warning) rồi chuyển thành Blob URL.
 */
const SafeImage = ({ src, className, alt, onClick, style }) => {
    const [imgUrl, setImgUrl] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!src) return;

        const fetchImage = async () => {
            try {
                // Nếu là link cục bộ (blob) thì dùng luôn
                if (src.startsWith('blob:')) {
                    setImgUrl(src);
                    return;
                }

                const response = await axios.get(src, {
                    responseType: 'blob',
                    headers: {
                        'ngrok-skip-browser-warning': 'true'
                    }
                });

                const objectUrl = URL.createObjectURL(response.data);
                setImgUrl(objectUrl);

                // Cleanup khi unmount
                return () => URL.revokeObjectURL(objectUrl);
            } catch (err) {
                console.error("SafeImage Load Error:", err);
                setError(true);
            }
        };

        fetchImage();
    }, [src]);

    if (error) return <span style={{ fontSize: '20px', color: '#ccc' }}>📷-</span>;
    if (!imgUrl) return <div className="img-placeholder" style={{ ...style, backgroundColor: '#333', borderRadius: '4px' }}></div>;

    return (
        <img
            src={imgUrl}
            className={className}
            alt={alt}
            onClick={onClick}
            style={style}
        />
    );
};

export default SafeImage;
