from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from core.deps import require_role
from models.user import UserRole
from models.vendor import Vendor, VendorStatus
from schemas.user import UserOut
from typing import List
from models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/vendors/pending")
def list_pending_vendors(
    db: Session = Depends(get_db),
    _admin=Depends(require_role(UserRole.admin)),
):
    vendors = db.query(Vendor).filter(Vendor.status == VendorStatus.pending).all()
    return vendors

@router.post("/vendors/{vendor_id}/approve")
def approve_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_role(UserRole.admin)),
):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.status = VendorStatus.approved
    db.commit()
    return {"message": "Vendor approved"}

@router.post("/vendors/{vendor_id}/reject")
def reject_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_role(UserRole.admin)),
):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.status = VendorStatus.rejected
    db.commit()
    return {"message": "Vendor rejected"}


@router.get("/vendors")
def list_all_vendors(db: Session = Depends(get_db), _admin=Depends(require_role(UserRole.admin))):
    vendors = db.query(Vendor).all()
    result = []
    for v in vendors:
        owner = db.query(User).filter(User.id == v.user_id).first()
        result.append({
            "id": v.id,
            "shop_name": v.shop_name,
            "status": v.status,
            "email": owner.email if owner else None,
            "created_at": v.created_at,
        })
    return result

@router.get("/users", response_model=List[UserOut])
def list_all_users(db: Session = Depends(get_db), _admin=Depends(require_role(UserRole.admin))):
    return db.query(User).all()