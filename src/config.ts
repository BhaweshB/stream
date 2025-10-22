export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
export const API_KEY = import.meta.env.VITE_API_KEY || 'dev-key-12345'

console.log('🔧 Config loaded:', { API_URL })
