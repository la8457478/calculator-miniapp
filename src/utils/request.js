/**
 * 统一 HTTP 请求封装
 * 在开发阶段配置为指向本地 FastAPI 后端
 * 上线时将 BASE_URL 改成云服务器地址即可，其他代码不变
 */

// 开发：本地 FastAPI  |  上线：改成 https://your-domain.com
const BASE_URL = 'http://175.24.131.147:8000'

/**
 * 发出一个 GET 请求并返回 Promise<data>
 * @param {string} path  例如 '/api/futures/list'
 * @param {object} params 可选查询参数
 */
export function get(path, params = {}) {
    return new Promise((resolve, reject) => {
        const url = BASE_URL + path
        uni.request({
            url,
            method: 'GET',
            data: params,
            success: (res) => {
                if (res.statusCode === 200 && res.data.code === 0) {
                    resolve(res.data.data)
                } else {
                    reject(new Error(res.data?.msg || '请求失败'))
                }
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}

/**
 * 发出一个 POST 请求并返回 Promise<data>
 */
export function post(path, body = {}) {
    return new Promise((resolve, reject) => {
        const url = BASE_URL + path
        uni.request({
            url,
            method: 'POST',
            data: body,
            header: { 'Content-Type': 'application/json' },
            success: (res) => {
                if (res.statusCode === 200 && res.data.code === 0) {
                    resolve(res.data.data)
                } else {
                    reject(new Error(res.data?.msg || '请求失败'))
                }
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}
