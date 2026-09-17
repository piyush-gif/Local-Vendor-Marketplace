from pydantic import BaseModel

class PaymentInitiate(BaseModel):
    order_id: int
    phone_number: str
    method: str = "esewa"  # or "khalti"

class PaymentVerify(BaseModel):
    order_id: int
    otp: str