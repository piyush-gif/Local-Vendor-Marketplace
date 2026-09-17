from fastapi import FastAPI
from db.database import engine
from db.base import Base
from models import user, vendor, product, cart, order, transaction  # noqa
from routers import auth, admin, product, cart, checkout, payment, vendor_orders

app = FastAPI(title="Vendor Marketplace API")   
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(product.router)
app.include_router(cart.router)
app.include_router(checkout.router)
app.include_router(payment.router)
app.include_router(vendor_orders.router)
@app.get("/")
def root():
    return {"message": "Vendor Marketplace API running"}