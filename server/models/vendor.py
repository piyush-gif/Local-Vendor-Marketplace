import enum
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from db.base import Base

class VendorStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    shop_name = Column(String(150), nullable=False)
    description = Column(String(500), nullable=True)
    status = Column(Enum(VendorStatus), default=VendorStatus.pending, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    products = relationship("Product", back_populates="vendor")