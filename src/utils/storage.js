/**
 * 跨端存储工具
 * 条件编译自动适配 H5 (localStorage) 和 小程序 (wx.setStorageSync)
 */
export const storage = {
    set(key, value) {
        try {
            // #ifdef H5
            localStorage.setItem(key, JSON.stringify(value));
            // #endif
            // #ifndef H5
            uni.setStorageSync(key, value);
            // #endif
        } catch (e) {
            console.error('[storage.set]', e);
        }
    },

    get(key) {
        try {
            // #ifdef H5
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
            // #endif
            // #ifndef H5
            return uni.getStorageSync(key) || null;
            // #endif
        } catch (e) {
            console.error('[storage.get]', e);
            return null;
        }
    },

    remove(key) {
        try {
            // #ifdef H5
            localStorage.removeItem(key);
            // #endif
            // #ifndef H5
            uni.removeStorageSync(key);
            // #endif
        } catch (e) {
            console.error('[storage.remove]', e);
        }
    },

    clear() {
        try {
            // #ifdef H5
            localStorage.clear();
            // #endif
            // #ifndef H5
            uni.clearStorageSync();
            // #endif
        } catch (e) {
            console.error('[storage.clear]', e);
        }
    }
};

export const STORAGE_KEYS = {
    HISTORY: 'calculator_history',
    POSITIONS: 'calculator_positions',
    LANG: 'appLang',
};

export const MAX_HISTORY = 50;
