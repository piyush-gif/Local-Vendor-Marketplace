from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from core.deps import require_role
from models.user import User, UserRole
from models.cart import Cart, CartItem
from models.product import Product
from models.order import Order, OrderItem, OrderStatus
from schemas.order import OrderOut

router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.post("/{vendor_id}", response_model=OrderOut)
def checkout(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.buyer)),
):
    cart = db.query(Cart).filter(Cart.buyer_id == current_user.id, Cart.vendor_id == vendor_id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0.0
    order_items_data = []

    for item in cart.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")

        line_total = product.price * item.quantity
        total += line_total
        order_items_data.append((product, item.quantity, product.price))

    order = Order(buyer_id=current_user.id, vendor_id=vendor_id, total=total, status=OrderStatus.pending)
    db.add(order)
    db.commit()
    db.refresh(order)

    for product, quantity, price in order_items_data:
        db.add(OrderItem(order_id=order.id, product_id=product.id, quantity=quantity, price_at_purchase=price))
        product.stock -= quantity  # reserve stock at order creation

    for item in cart.items:
        db.delete(item)
    db.delete(cart)

    db.commit()
    db.refresh(order)
    return order