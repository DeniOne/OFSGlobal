import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class Database:
    """Класс для работы с временным хранилищем данных"""
    
    def __init__(self, storage_path: str = "./data"):
        """Инициализация базы данных"""
        self.storage_path = storage_path
        self.employees_file = os.path.join(storage_path, "employees.json")
        self.ensure_storage_exists()
    
    def ensure_storage_exists(self):
        """Проверяет и создает директорию для хранения данных если она не существует"""
        if not os.path.exists(self.storage_path):
            os.makedirs(self.storage_path)
            logger.info(f"Создана директория хранилища: {self.storage_path}")
        
        # Создаем файл с сотрудниками, если он не существует
        if not os.path.exists(self.employees_file):
            with open(self.employees_file, 'w', encoding='utf-8') as f:
                json.dump([], f, ensure_ascii=False, indent=2)
            logger.info(f"Создан файл для хранения сотрудников: {self.employees_file}")
    
    def add_employee(self, name: str, position: str, email: str, 
                   phone: str, competencies: List[str],
                   telegram_id: str = None, photo_id: str = None) -> str:
        """Добавляет нового сотрудника в базу данных"""
        try:
            # Генерируем уникальный ID
            employee_id = str(uuid.uuid4())
            
            # Создаем запись о сотруднике
            employee = {
                "id": employee_id,
                "name": name,
                "position": position,
                "email": email,
                "phone": phone,
                "telegram_id": telegram_id,
                "photo_id": photo_id,
                "competencies": competencies,
                "created_at": datetime.now().isoformat(),
                "status": "pending",  # pending, approved, rejected
            }
            
            # Загружаем существующие данные
            employees = self.get_all_employees()
            
            # Добавляем нового сотрудника
            employees.append(employee)
            
            # Сохраняем обновленные данные
            with open(self.employees_file, 'w', encoding='utf-8') as f:
                json.dump(employees, f, ensure_ascii=False, indent=2)
            
            logger.info(f"Добавлен новый сотрудник с ID: {employee_id}")
            return employee_id
        
        except Exception as e:
            logger.error(f"Ошибка при добавлении сотрудника: {e}")
            raise
    
    def get_all_employees(self) -> List[Dict[str, Any]]:
        """Возвращает список всех сотрудников"""
        try:
            if not os.path.exists(self.employees_file):
                return []
            
            with open(self.employees_file, 'r', encoding='utf-8') as f:
                employees = json.load(f)
            
            return employees
        
        except Exception as e:
            logger.error(f"Ошибка при получении списка сотрудников: {e}")
            return []
    
    def get_employee_by_id(self, employee_id: str) -> Optional[Dict[str, Any]]:
        """Возвращает сотрудника по ID"""
        try:
            employees = self.get_all_employees()
            
            for employee in employees:
                if employee.get("id") == employee_id:
                    return employee
            
            return None
        
        except Exception as e:
            logger.error(f"Ошибка при поиске сотрудника по ID: {e}")
            return None
    
    def update_employee(self, employee_id: str, data: Dict[str, Any]) -> bool:
        """Обновляет данные сотрудника"""
        try:
            employees = self.get_all_employees()
            updated = False
            
            for i, employee in enumerate(employees):
                if employee.get("id") == employee_id:
                    # Обновляем данные, сохраняя неизменными id и created_at
                    data["id"] = employee_id
                    data["created_at"] = employee.get("created_at")
                    data["updated_at"] = datetime.now().isoformat()
                    
                    employees[i] = data
                    updated = True
                    break
            
            if updated:
                with open(self.employees_file, 'w', encoding='utf-8') as f:
                    json.dump(employees, f, ensure_ascii=False, indent=2)
                logger.info(f"Обновлены данные сотрудника с ID: {employee_id}")
                return True
            else:
                logger.warning(f"Сотрудник с ID {employee_id} не найден для обновления")
                return False
        
        except Exception as e:
            logger.error(f"Ошибка при обновлении данных сотрудника: {e}")
            return False
    
    def delete_employee(self, employee_id: str) -> bool:
        """Удаляет сотрудника из базы данных"""
        try:
            employees = self.get_all_employees()
            initial_count = len(employees)
            
            employees = [emp for emp in employees if emp.get("id") != employee_id]
            
            if len(employees) < initial_count:
                with open(self.employees_file, 'w', encoding='utf-8') as f:
                    json.dump(employees, f, ensure_ascii=False, indent=2)
                logger.info(f"Удален сотрудник с ID: {employee_id}")
                return True
            else:
                logger.warning(f"Сотрудник с ID {employee_id} не найден для удаления")
                return False
        
        except Exception as e:
            logger.error(f"Ошибка при удалении сотрудника: {e}")
            return False
    
    def get_employees_by_competency(self, competency: str) -> List[Dict[str, Any]]:
        """Возвращает список сотрудников с указанной компетенцией"""
        try:
            employees = self.get_all_employees()
            return [emp for emp in employees if competency in emp.get("competencies", [])]
        
        except Exception as e:
            logger.error(f"Ошибка при поиске сотрудников по компетенции: {e}")
            return []
    
    def update_employee_status(self, employee_id: str, status: str) -> bool:
        """Обновляет статус проверки сотрудника (pending, approved, rejected)"""
        try:
            employees = self.get_all_employees()
            updated = False
            
            for i, employee in enumerate(employees):
                if employee.get("id") == employee_id:
                    employee["status"] = status
                    employee["updated_at"] = datetime.now().isoformat()
                    employees[i] = employee
                    updated = True
                    break
            
            if updated:
                with open(self.employees_file, 'w', encoding='utf-8') as f:
                    json.dump(employees, f, ensure_ascii=False, indent=2)
                logger.info(f"Обновлен статус сотрудника с ID {employee_id} на {status}")
                return True
            else:
                logger.warning(f"Сотрудник с ID {employee_id} не найден для обновления статуса")
                return False
        
        except Exception as e:
            logger.error(f"Ошибка при обновлении статуса сотрудника: {e}")
            return False 