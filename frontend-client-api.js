/**
 * StudyOS Frontend API Client
 * 
 * Instructions: 
 * Drop this file into your frontend project's /src directory.
 * Make sure to install axios: `npm install axios`
 */

import axios from 'axios';

// ==========================================
// 1. AXIOS CONFIGURATION
// ==========================================

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api/v1'; 
// Note: Assuming backend runs on 5000 by default (as per our server.js). 
// Update to 8000 if your backend is configured for that port.

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studyos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Error Handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Handle unauthorized (token expiration)
      if (error.response.status === 401) {
        console.error('Session expired. Please log in again.');
        localStorage.removeItem('studyos_token');
        // window.location.href = '/login'; // Optional Redirect
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ message: 'Network error or system down.' });
  }
);

// ==========================================
// 2. AUTH INTEGRATION
// ==========================================

export const authApi = {
  signup: async (userData) => {
    const res = await api.post('/auth/register', userData); // mapped to our /auth/register
    return res;
  },
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data?.token) {
      localStorage.setItem('studyos_token', res.data.token);
    }
    return res;
  },
  getMe: async () => {
    return await api.get('/auth/me');
  },
  logout: () => {
    localStorage.removeItem('studyos_token');
  }
};

// ==========================================
// 3. CONTENT INTEGRATION
// ==========================================

export const contentApi = {
  getExams: async () => {
    return await api.get('/exams');
  },
  getSubjects: async (examId) => {
    return await api.get(`/subjects/exam/${examId}`);
  },
  getChapters: async (subjectId) => {
    return await api.get(`/chapters/subject/${subjectId}`);
  }
};

// ==========================================
// 4. PLANNER INTEGRATION
// ==========================================

export const plannerApi = {
  getPlans: async () => {
    return await api.get('/plans');
  },
  generatePlan: async (planConfig) => {
    return await api.post('/plans/generate', planConfig);
  }
};

// ==========================================
// 5. TODAY TASKS
// ==========================================

export const taskApi = {
  getTodayTasks: async () => {
    return await api.get('/today');
  },
  completeTask: async (taskId) => {
    return await api.patch(`/tasks/${taskId}/status`, { status: 'completed' });
  }
};

// ==========================================
// 6. PROGRESS (Core Module)
// ==========================================

export const progressApi = {
  getProgress: async () => {
    return await api.get('/progress/session/active'); 
  }
};

// ==========================================
// 7. QUIZ
// ==========================================

export const quizApi = {
  generateQuiz: async (chapterId, count = 10) => {
    return await api.post('/quizzes/generate/chapter', { chapterId, count });
  },
  startQuiz: async (quizId) => {
    return await api.post(`/quizzes/${quizId}/start`);
  },
  submitAnswer: async (quizId, questionId, selectedAnswer) => {
    return await api.post(`/quizzes/${quizId}/answer`, { questionId, selectedAnswer });
  },
  finishQuiz: async (quizId) => {
    return await api.post(`/quizzes/${quizId}/finish`);
  }
};

// ==========================================
// 8. ANALYTICS (Simple Analytics Module)
// ==========================================

export const analyticsApi = {
  getAnalytics: async (userId = 'me') => {
    return await api.get(`/simple-analytics/${userId}`);
  }
};

// ==========================================
// 9. AI MODULE (Simple AI)
// ==========================================

export const aiApi = {
  getRecommendation: async (userId = 'me') => {
    return await api.get(`/ai/recommend/${userId}`);
  },
  getWeakAdvice: async (userId = 'me') => {
    return await api.get(`/ai/weak/${userId}`);
  },
  getMotivation: async () => {
    return await api.get('/ai/motivate');
  }
};

// ==========================================
// 10. GAMIFICATION (Simple Gamification)
// ==========================================

export const gamificationApi = {
  addXp: async (points) => {
    return await api.post('/simple-gamification/xp', { points });
  },
  getLevel: async (userId = 'me') => {
    return await api.get(`/simple-gamification/level/${userId}`);
  },
  getStreak: async (userId = 'me') => {
    return await api.get(`/simple-gamification/streak/${userId}`);
  }
};

// ==========================================
// 11. EXTRAS
// ==========================================

export const extraApi = {
  getCalendar: async (userId = 'me') => {
    return await api.get(`/calendar/${userId}`); // Handled by extra module
  },
  getNotifications: async (userId = 'me') => {
    return await api.get(`/notifications/${userId}`); 
  },
  getSessions: async (userId = 'me') => {
    return await api.get(`/sessions/${userId}`);
  }
};

export default api;
