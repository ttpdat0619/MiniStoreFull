/**
 * Hàm loại bỏ dấu tiếng Việt để search chính xác hơn
 */
export const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

/**
 * Hàm search gần đúng (Fuzzy Search): kiểm tra các ký tự có xuất hiện theo đúng thứ tự không
 */
export const isFuzzyMatch = (target, search) => {
    const t = removeAccents(target);
    const s = removeAccents(search);
    let searchIdx = 0;
    for (let i = 0; i < t.length && searchIdx < s.length; i++) {
        if (t[i] === s[searchIdx]) {
            searchIdx++;
        }
    }
    return searchIdx === s.length;
};
