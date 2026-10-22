import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const getDashboard = (params) => api.get('/dashboard', { params })
export const getTransactions = (params) => api.get('/transactions/', { params })
export const createTransaction = (data) => api.post('/transactions/', data)
export const updateTransaction = (id, data) => api.put(`/transactions/${id}`, data)
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`)
export const getCategories = () => api.get('/categories/')
export const createCategory = (data) => api.post('/categories/', data)
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data)
export const deleteCategory = (id) => api.delete(`/categories/${id}`)
export const getBudgets = (params) => api.get('/budgets/', { params })
export const createBudget = (data) => api.post('/budgets/', data)
export const updateBudget = (id, data) => api.put(`/budgets/${id}`, data)
export const deleteBudget = (id) => api.delete(`/budgets/${id}`)
