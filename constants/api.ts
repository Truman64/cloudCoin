// constants/api.ts

export const LOCAL_API = {
  BASE_URL: 'https://localhost:7102',
  INTEGRITY_STATUS: '/api/integrity/status',
  GOOGLE_AUTH: '/api/auth/google',
};

export const PROD_API = {
  BASE_URL: 'https://ai.jtruman.work/CloudDataIntegrity',
  INTEGRITY_STATUS: '/api/integrity/status',
    GOOGLE_AUTH: '/api/auth/google',
}; 
const USE_PROD = true;  

export const API = USE_PROD ? PROD_API : LOCAL_API;
console.log(`API Config: Using ${USE_PROD ? 'Production' : 'Local'} API`);