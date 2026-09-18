import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.config import settings

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CA_PATH = os.path.join(BASE_DIR, "..", "ca.pem")

connect_args = {}
if "aivencloud.com" in settings.database_url:
    connect_args = {"ssl": {"ca": CA_PATH}}

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()