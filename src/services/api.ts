import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to show beautiful session expired modal
const showSessionExpiredModal = (redirectUrl: string) => {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'session-expired-modal';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    animation: fadeIn 0.3s ease;
  `;

  // Create modal box
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 20px;
    padding: 40px;
    max-width: 420px;
    width: 90%;
    text-align: center;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
    animation: slideUp 0.4s ease;
    position: relative;
    overflow: hidden;
  `;

  // Add decorative glow
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
    pointer-events: none;
  `;
  modal.appendChild(glow);

  // Create icon container
  const iconContainer = document.createElement('div');
  iconContainer.style.cssText = `
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);
    position: relative;
  `;
  iconContainer.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  `;
  modal.appendChild(iconContainer);

  // Urdu text
  const urduText = document.createElement('p');
  urduText.style.cssText = `
    font-size: 18px;
    color: #f8fafc;
    margin-bottom: 12px;
    direction: rtl;
    font-family: 'Noto Nastaliq Urdu', serif;
    line-height: 1.8;
    position: relative;
  `;
  urduText.textContent = 'آپ کو کسی اور ڈیوائس سے لاگ آؤٹ کر دیا گیا ہے۔';
  modal.appendChild(urduText);

  // English text
  const englishText = document.createElement('p');
  englishText.style.cssText = `
    font-size: 14px;
    color: #94a3b8;
    margin-bottom: 8px;
    line-height: 1.6;
    position: relative;
  `;
  englishText.textContent = 'You have been logged out because your account was accessed from another device.';
  modal.appendChild(englishText);

  // Subtext
  const subText = document.createElement('p');
  subText.style.cssText = `
    font-size: 13px;
    color: #64748b;
    margin-bottom: 28px;
    position: relative;
  `;
  subText.textContent = 'براہ کرم دوبارہ لاگ ان کریں۔ • Please login again.';
  modal.appendChild(subText);

  // Button
  const button = document.createElement('button');
  button.style.cssText = `
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    color: white;
    border: none;
    padding: 14px 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
    position: relative;
  `;
  button.textContent = 'لاگ ان کریں • Login';
  button.onmouseover = () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 15px 35px rgba(139, 92, 246, 0.4)';
  };
  button.onmouseout = () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.3)';
  };
  button.onclick = () => {
    window.location.href = redirectUrl;
  };
  modal.appendChild(button);

  // Add animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;
  document.head.appendChild(style);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
};

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if session was replaced (logged in from another device)
      if (error.response?.data?.code === 'SESSION_REPLACED') {
        // Clear all auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('auth-storage');
        
        // All login is on /login page (both admin and LMS student)
        showSessionExpiredModal('/login');
      } else {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
