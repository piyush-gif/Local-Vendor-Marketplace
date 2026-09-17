import enum
from sqlalchemy import Column, Integer, String, Enum, DateTime, func
from db.base import Base

class UserRole(str, enum.Enum):
    buyer = "buyer"
    vendor = "vendor"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    created_at = Column(DateTime, server_default=func.now())