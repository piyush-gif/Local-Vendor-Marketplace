from pydantic import BaseModel
from typing import List

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True

class CartOut(BaseModel):
    id: int
    vendor_id: int
    items: List[CartItemOut]

    class Config:
        from_attributes = True