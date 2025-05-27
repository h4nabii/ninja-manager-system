import axios from 'axios'
import { ElMessage } from 'element-plus'

export const instance = axios.create({
  baseURL: '/ninja_api',
})

instance.interceptors.response.use(
  (resp) => {
    const info = resp.data
    if (info.success) return resp
    else {
      ElMessage.error(info.message || '请求失败')
      return resp
    }
  },
  () => {},
)
