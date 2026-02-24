import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const verifyText = (text, searchMode = 'official') =>
  api.post('/verify', { text, searchMode }, { headers: { 'Content-Type': 'application/json' } })

export const verifyImage = (file, searchMode = 'official') => {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('searchMode', searchMode)
  return api.post('/verify', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export const getHistory = () => api.get('/history')

export const getDetail = (id) => api.get(`/history/${id}`)

export const deleteRecord = (id) => api.delete(`/history/${id}`)

export default api
