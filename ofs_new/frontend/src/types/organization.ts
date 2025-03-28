/**
 * Типы данных для работы с организационной структурой
 */

// Организация
export interface Organization {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

// Отдел/дивизион
export interface Division {
  id: number;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  level?: number;
  organization_id: number;
  parent_id?: number | null;
  
  // Дополнительные поля для UI
  children?: Division[];
  hasChildren?: boolean;
}

// Должность
export interface Position {
  id: number;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  organization_id: number;
}

// Тип функциональной связи
export enum RelationType {
  FUNCTIONAL = 'functional',
  ADMINISTRATIVE = 'administrative',
  PROJECT = 'project',
  TERRITORIAL = 'territorial',
  MENTORING = 'mentoring'
}

// Функциональная связь
export interface FunctionalRelation {
  id: number;
  manager_id: number;
  subordinate_id: number;
  relation_type: RelationType;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Сотрудник
export interface Employee {
  id: number;
  name: string;
  position: string;
  division: string;
  level: number;
  organization_id: number;
  parent_id?: number | null;
  photo_path?: string;
  phone?: string;
  email?: string;
  telegram_id?: string;
  is_active: boolean;
  
  // Дополнительные поля для UI
  children?: Employee[];
  functionalConnections?: {
    id: string;
    type: RelationType;
    name: string;
  }[];
} 