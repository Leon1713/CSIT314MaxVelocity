import os
from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

os.makedirs("uploads/profile_pictures", exist_ok=True)
from db import close_pool
from routes.signup import router as router_reg
from routes.login import router as router_login
from routes.getSession import router as router_me
from routes.admin import router as router_admin
from routes.logout import router as router_logout
from routes.fundraiser import router as router_fundraiser
from routes.profile import router as router_profile
from routes.platform import router as router_platform
@asynccontextmanager
async def lifespan(app: FastAPI):
    from Dependencies.CleanUpSession import SessionCleanUp
    await SessionCleanUp.cleanUpExpiredSessions()
    yield
    close_pool()

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router_reg)
app.include_router(router_login)
app.include_router(router_me)
app.include_router(router_admin)
app.include_router(router_logout)
app.include_router(router_fundraiser)
app.include_router(router_profile)
app.include_router(router_platform)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# app.mount("/styles", StaticFiles(directory="styles"), name="styles")
# app.mount("/img", StaticFiles(directory="img"), name="img")   
# app.mount("/pages", StaticFiles(directory="pages"), name="static")
# app.mount("/scripts", StaticFiles(directory="scripts"), name="static")
