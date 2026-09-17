from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from core.deps import require_role
from models.user import User, UserRole
from models.cart import Cart, CartItem
from models.product import Product
from schemas.cart import CartItemAdd, CartItemUpdate, CartOut

router = APIRouter(prefix="/cart", tags=["cart"])


def get_or_create_cart(buyer_id: int, vendor_id: int, db: Session) -> Cart:
    cart = db.query(Cart).filter(Cart.buyer_id == buyer_id, Cart.vendor_id == vendor_id).first()
    if not cart:
        cart = Cart(buyer_id=buyer_id, vendor_id=vendor_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


@router.get("", response_model=List[CartOut])
def list_my_carts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.buyer)),
):
    return db.query(Cart).filter(Cart.buyer_id == current_user.id).all()


@router.get("/{vendor_id}", response_model=CartOut)
def get_cart_for_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.buyer)),
):
    cart = db.query(Cart).filter(Cart.buyer_id == current_user.id, Cart.vendor_id == vendor_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="No cart for this vendor yet")
    return cart


@router.post("/add", response_model=CartOut)
def add_to_cart(
    payload: CartItemAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.buyer)),
):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    cart = get_or_create_cart(current_user.id, product.vendor_id, db)

    item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == product.id).first()
    if item:
        item.quantity += payload.quantity
    else:
        item = CartItem(cart_id=cart.id, product_id=product.id, quantity=payload.quantity)
        db.add(item)

    db.commit()
    db.refresh(cart)
    return cart


@router.put("/item/{item_id}", response_model=CartOut)
def update_cart_item(
    item_id: int,
    payload: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.buyer)),
):
    item = db.query(CartItem).join(Cart).filter(CartItem.id == item_id, Cart.buyer_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    item.quantity = payload.quantity
    db.commit()

    cart = db.query(Cart).filter(Cart.id == item.cart_id).first()
    db.refresh(cart)
    return cart


@router.delete("/item/{item_id}")
def remove_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.buyer)),
):
    item = db.query(CartItem).join(Cart).filter(CartItem.id == item_id, Cart.buyer_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    return {"message": "Item removed from cart"}  