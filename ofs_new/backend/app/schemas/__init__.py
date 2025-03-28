from .item import Item, ItemCreate, ItemUpdate
from .msg import Msg
from .token import Token, TokenPayload
from .user import User, UserCreate, UserInDB, UserUpdate
from .organization import Organization, OrganizationCreate, OrganizationInDB, OrganizationUpdate
from .division import Division, DivisionCreate, DivisionInDB, DivisionUpdate, DivisionTree
from .staff import Staff, StaffCreate, StaffInDB, StaffUpdate, StaffWithRelations
from .functional_relation import FunctionalRelation, FunctionalRelationCreate, FunctionalRelationUpdate
from .position import Position, PositionCreate, PositionUpdate

# Для обратной совместимости
from .division import Division as Department, DivisionCreate as DepartmentCreate, DivisionInDB as DepartmentInDB, DivisionUpdate as DepartmentUpdate, DivisionTree as DepartmentTree
from .staff import Staff as Employee, StaffCreate as EmployeeCreate, StaffInDB as EmployeeInDB, StaffUpdate as EmployeeUpdate, StaffWithRelations as EmployeeWithRelations