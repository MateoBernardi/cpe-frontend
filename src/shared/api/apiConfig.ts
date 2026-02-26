const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  CONTENT_PREFIX: '/content',
  PUBLIC_PREFIX: '/public',
  /** Hardcodeado hasta implementar JWT */
  TENANT_ID: '1',
} as const

export default ENV
