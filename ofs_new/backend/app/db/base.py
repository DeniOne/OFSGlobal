# Импортируем базовый класс модели
from app.db.base_class import Base  # noqa

# Импортируем все модели, чтобы Alembic мог их обнаружить
# Здесь должны быть импорты всех моделей
# from app.models.department import Department  # noqa - Заменено на Division
from app.models.division import Division  # noqa
from app.models.organization import Organization  # noqa
from app.models.position import Position  # noqa
from app.models.staff import Staff  # noqa
from app.models.user import User  # noqa
from app.models.functional_relation import FunctionalRelation  # noqa
# Модель Employee больше не используется, заменена на Staff
# Добавьте сюда импорты других моделей по мере необходимости 