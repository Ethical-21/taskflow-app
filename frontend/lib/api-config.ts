// Central API configuration — reads from environment variable.
// In development: set NEXT_PUBLIC_API_URL in .env.local
// In production: set NEXT_PUBLIC_API_URL in Vercel dashboard to your Render backend URL

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default BASE_URL
