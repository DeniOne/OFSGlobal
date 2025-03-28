# Импортируем базовый класс модели
from app.db.base_class import Base  # noqa

# Импортируем все модели, чтобы Alembic мог их обнаружить
# Здесь должны быть импорты всех моделей
from app.models.department import Department  # noqa
from app.models.organization import Organization  # noqa
from app.models.position import Position  # noqa
from app.models.staff import Staff  # noqa
from app.models.user import User  # noqa
# Добавьте сюда импорты других моделей по мере необходимости 