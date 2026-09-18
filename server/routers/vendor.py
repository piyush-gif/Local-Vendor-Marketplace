from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from models.vendor import Vendor, VendorStatus

router = APIRouter(prefix="/vendors", tags=["vendors"])

@router.get("/{vendor_id}")
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id, Vendor.status == VendorStatus.approved).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"id": vendor.id, "shop_name": vendor.shop_name, "description": vendor.description}