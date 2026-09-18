from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from core.deps import require_role
from models.user import User, UserRole
from models.vendor import Vendor
from models.order import Order, OrderStatus
from models.product import Product

router = APIRouter(prefix="/vendor", tags=["vendor-profile"])

def get_own_vendor(current_user: User, db: Session) -> Vendor:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    return vendor

@router.get("/me")
def get_my_vendor(db: Session = Depends(get_db), current_user: User = Depends(require_role(UserRole.vendor))):
    vendor = get_own_vendor(current_user, db)
    return {"id": vendor.id, "shop_name": vendor.shop_name, "description": vendor.description, "status": vendor.status}

@router.get("/stats")
def get_my_stats(db: Session = Depends(get_db), current_user: User = Depends(require_role(UserRole.vendor))):
    vendor = get_own_vendor(current_user, db)
    return {
        "total_products": db.query(Product).filter(Product.vendor_id == vendor.id).count(),
        "total_orders": db.query(Order).filter(Order.vendor_id == vendor.id).count(),
        "pending_orders": db.query(Order).filter(Order.vendor_id == vendor.id, Order.status == OrderStatus.paid).count(),
        "fulfilled_orders": db.query(Order).filter(Order.vendor_id == vendor.id, Order.status == OrderStatus.fulfilled).count(),
    }