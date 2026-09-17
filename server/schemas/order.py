from pydantic import BaseModel
from typing import List
from models.order import OrderStatus

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_purchase: float

    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    buyer_id: int
    vendor_id: int
    total: float
    status: OrderStatus
    items: List[OrderItemOut]

    class Config:
        from_attributes = True