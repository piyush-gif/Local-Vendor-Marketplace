from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from db.database import get_db
from core.deps import get_current_user, require_role
from models.user import User, UserRole
from models.vendor import Vendor, VendorStatus
from models.product import Product
from schemas.product import ProductCreate, ProductUpdate, ProductOut

router = APIRouter(prefix="/products", tags=["products"])


def get_own_approved_vendor(current_user: User, db: Session) -> Vendor:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    if vendor.status != VendorStatus.approved:
        raise HTTPException(status_code=403, detail="Vendor not approved yet")
    return vendor


# --- Public browse/search ---

@router.get("", response_model=List[ProductOut])
def browse_products(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    vendor_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Product).join(Vendor).filter(Vendor.status == VendorStatus.approved)

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if category:
        query = query.filter(Product.category == category)
    if vendor_id:
        query = query.filter(Product.vendor_id == vendor_id)

    return query.all()

@router.get("/mine/list", response_model=List[ProductOut])
def list_my_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.vendor)),
):
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    return db.query(Product).filter(Product.vendor_id == vendor.id).all()

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# --- Vendor-only management (scoped to their own products) ---

@router.post("", response_model=ProductOut)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.vendor)),
):
    vendor = get_own_approved_vendor(current_user, db)
    product = Product(vendor_id=vendor.id, **payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.vendor)),
):
    vendor = get_own_approved_vendor(current_user, db)
    product = db.query(Product).filter(Product.id == product_id, Product.vendor_id == vendor.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.vendor)),
):
    vendor = get_own_approved_vendor(current_user, db)
    product = db.query(Product).filter(Product.id == product_id, Product.vendor_id == vendor.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}