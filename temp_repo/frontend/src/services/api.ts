import axios from 'axios';
import { API_URL } from '../config';

// Создаем инстанс axios с базовыми настройками
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: false  // Отключаем для работы без сессий
});

// !!! ОТЛАДОЧНЫЙ ЛОГ: Проверяем реальный baseURL
console.log(`[LOG:API_CONFIG] Используемый baseURL для axios: ${api.defaults.baseURL}`);

// Логи запросов
api.interceptors.request.use(
  config => {
    console.log(`[LOG:API] Отправка ${config.method?.toUpperCase()} запроса на ${config.url}`);
    
    // Проверка токена при каждом запросе
    const token = localStorage.getItem('token');
    if (token) {
      console.log(`[LOG:API] Токен найден: ${token.substring(0, 15)}...`);
      
      // Явно выставляем заголовок авторизации
      config.headers['Authorization'] = `Bearer ${token}`;
      
      // Проверяем, что заголовок установлен
      console.log(`[LOG:API] Заголовок Authorization установлен: ${config.headers['Authorization']}`);
    } else {
      console.log('[LOG:API] Токен не найден в localStorage');
    }
    
    return config;
  },
  error => {
    console.error('[LOG:API] Ошибка при отправке запроса:', error);
    return Promise.reject(error);
  }
);

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  response => {
    console.log(`[LOG:API] Успешный ответ от ${response.config.url}`);
    return response;
  },
  error => {
    if (error.response) {
      // Проверяем статус ошибки
      if (error.response.status === 401) {
        console.error('[LOG:API] Ошибка 401: Необходима авторизация');
        console.log('[LOG:API] Заголовки запроса:', error.config.headers);
        
        // Проверяем, что мы не на странице логина, чтобы избежать бесконечной перезагрузки
        const isLoginPage = window.location.pathname.includes('/login');
        if (!isLoginPage && error.config.url !== '/login/test-token') {
          // Редиректим на логин только если мы не на странице логина и запрос не на проверку токена
          console.log('[LOG:API] Перенаправление на страницу логина...');
          window.location.href = '/login';
        }
        
        return Promise.reject(new Error('Необходима авторизация'));
      }
      console.error(`[LOG:API] Ошибка ${error.response.status}:`, error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      console.error('[LOG:API] Ошибка сети, нет ответа от сервера');
      return Promise.reject(new Error('Ошибка сети. Проверьте подключение.'));
    } else {
      console.error('[LOG:API] Ошибка:', error.message);
      return Promise.reject(error);
    }
  }
);

export default api; 