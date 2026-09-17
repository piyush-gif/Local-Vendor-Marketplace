from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from core.deps import require_role
from models.user import User, UserRole
from models.vendor import Vendor
from models.order import Order, OrderStatus
from schemas.order import OrderOut, OrderStatusUpdate

router = APIRouter(prefix="/vendor/orders", tags=["vendor-orders"])


def get_own_vendor(current_user: User, db: Session) -> Vendor:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    return vendor


@router.get("", response_model=List[OrderOut])
def list_vendor_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.vendor)),
):
    vendor = get_own_vendor(current_user, db)
    return db.query(Order).filter(Order.vendor_id == vendor.id).all()


@router.put("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.vendor)),
):
    vendor = get_own_vendor(current_user, db)
    order = db.query(Order).filter(Order.id == order_id, Order.vendor_id == vendor.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only allow sensible transitions: paid -> fulfilled, or -> cancelled
    if order.status not in (OrderStatus.paid, OrderStatus.pending):
        raise HTTPException(status_code=400, detail=f"Cannot change status from {order.status}")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order