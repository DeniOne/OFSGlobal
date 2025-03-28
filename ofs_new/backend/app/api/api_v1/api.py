from fastapi import APIRouter

from app.api.api_v1.endpoints import (
    items, login, users, organizations,
    telegram_bot, positions, division, staff, personnel, 
    functional_relation, functional_relations
)

api_router = APIRouter()

# Базовые модули
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])

# Бизнес-модули
api_router.include_router(personnel.router, prefix="/personnel", tags=["personnel"])
api_router.include_router(
    functional_relation.router,
    prefix="/functional-relations",
    tags=["functional-relations"]
)
api_router.include_router(
    telegram_bot.router,
    prefix="/telegram-bot",
    tags=["telegram-bot"]
)
api_router.include_router(positions.router, prefix="/positions", tags=["positions"])
api_router.include_router(division.router, prefix="/divisions", tags=["divisions"])
api_router.include_router(staff.router, prefix="/staff", tags=["staff"])
api_router.include_router(functional_relations.router, prefix="/functional-relations-v2", tags=["functional-relations-v2"])
