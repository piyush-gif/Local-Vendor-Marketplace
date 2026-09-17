import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from core.deps import require_role
from models.user import User, UserRole
from models.order import Order, OrderStatus
from models.transaction import Transaction
from schemas.payment import PaymentInitiate, PaymentVerify

router = APIRouter(prefix="/payment", tags=["payment"])

# In-memory OTP store for the demo (order_id -> otp). Fine for a portfolio project,
# not for real production use.
_otp_store: dict[int, str] = {}


@router.post("/initiate")
def initiate_payment(
    payload: PaymentInitiate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.buyer)),
):
    order = db.query(Order).filter(Order.id == payload.order_id, Order.buyer_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != OrderStatus.pending:
        raise HTTPException(status_code=400, detail="Order is not pending payment")

    otp = "".join(random.choices(string.digits, k=6))
    _otp_store[order.id] = otp

    # Simulated: in a real esewa/khalti flow this would trigger an SMS.
    # Returning it directly here so you can test end-to-end without SMS integration.
    return {"message": "OTP sent (simulated)", "otp_for_testing": otp}


@router.post("/verify")
def verify_payment(
    payload: PaymentVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.buyer)),
):
    order = db.query(Order).filter(Order.id == payload.order_id, Order.buyer_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    real_otp = _otp_store.get(order.id)
    if not real_otp or real_otp != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    transaction_id = "TXN" + "".join(random.choices(string.ascii_uppercase + string.digits, k=10))

    transaction = Transaction(
        order_id=order.id,
        method="esewa",
        otp_verified=True,
        wallet_balance_used=order.total,
        transaction_id=transaction_id,
    )
    db.add(transaction)

    order.status = OrderStatus.paid
    db.commit()

    del _otp_store[order.id]

    return {"message": "Payment successful", "transaction_id": transaction_id, "order_status": order.status}