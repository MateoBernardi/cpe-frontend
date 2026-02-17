const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  CONTENT_PREFIX: '/content',
} as const

export default ENV
