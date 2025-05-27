import axios from 'axios'

export const instance = axios.create({
  baseURL: '/ninja_api',
})

instance.interceptors.response.use(
  (resp) => {
    const info = resp.data
    if (info.success) return resp
    else return resp
  },
  () => {},
)
