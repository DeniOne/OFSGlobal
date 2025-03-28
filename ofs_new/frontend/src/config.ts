/**
 * Конфигурационные параметры приложения
 */

// API URL для работы с бэкендом
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Настройки загрузки файлов
export const UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Параметры пагинации по умолчанию
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Интервал автоматического обновления данных (в миллисекундах)
export const AUTO_REFRESH_INTERVAL = 60000; // 1 минута

// Текст ошибок
export const ERROR_MESSAGES = {
  fileTooLarge: 'Размер файла превышает максимально допустимый (5 MB)',
  fileTypeNotAllowed: 'Неподдерживаемый тип файла',
  defaultError: 'Произошла ошибка при обработке запроса',
  networkError: 'Ошибка сети. Проверьте подключение к интернету'
};

// Настройки для организационной структуры
export const ORG_STRUCTURE_CONFIG = {
  maxLevels: 10,
  levelColors: [
    '#3f51b5', // Уровень 1 - высший
    '#4527a0',
    '#673ab7',
    '#7b1fa2',
    '#9c27b0',
    '#c2185b',
    '#d32f2f',
    '#e64a19',
    '#f57c00',
    '#ffa000'  // Уровень 10 - низший
  ]
}; 