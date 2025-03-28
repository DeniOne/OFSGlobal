// Конфигурация API и других глобальных настроек приложения

// Базовый URL API бэкенда
export const API_URL = 'http://localhost:8000/api/v1';

// Настройки пагинации по умолчанию
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Настройки загрузки файлов
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

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