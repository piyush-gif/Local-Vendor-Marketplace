from fastapi import FastAPI
from db.database import engine
from db.base import Base
from models import user, vendor, product, cart, order, transaction  # noqa

app = FastAPI(title="Vendor Marketplace API")

@app.get("/")
def root():
    return {"message": "Vendor Marketplace API running"}