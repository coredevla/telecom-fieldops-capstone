export const env = {
  PORT: Number(process.env.PORT || 3000),
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-me",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  API_PUBLIC_URL: process.env.API_PUBLIC_URL || "http://localhost:3000"

};