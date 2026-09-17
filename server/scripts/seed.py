import random
import requests
from faker import Faker

from db.database import SessionLocal
from models.user import User, UserRole
from models.vendor import Vendor, VendorStatus
from models.product import Product
from core.security import hash_password
from core.config import settings

fake = Faker()
db = SessionLocal()

CATEGORIES = ["groceries", "handicrafts", "clothing", "electronics", "home goods"]



def fetch_images_for_category(category: str, count: int = 15) -> list[str]:
    url = "https://api.unsplash.com/search/photos"
    headers = {"Authorization": f"Client-ID {settings.unsplash_access_key}"}
    params = {"query": category, "per_page": count}

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    data = response.json()

    return [photo["urls"]["small"] for photo in data.get("results", [])]


print("Fetching images from Unsplash...")
category_images = {cat: fetch_images_for_category(cat) for cat in CATEGORIES}
for cat, imgs in category_images.items():
    print(f"  {cat}: {len(imgs)} images fetched")


NUM_VENDORS = 15
vendors = []

for _ in range(NUM_VENDORS):
    name = fake.name()
    email = fake.unique.email()
    user = User(
        name=name,
        email=email,
        password_hash=hash_password("password123"),
        role=UserRole.vendor,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    vendor = Vendor(
        user_id=user.id,
        shop_name=fake.company(),
        description=fake.catch_phrase(),
        status=VendorStatus.approved,  # pre-approved so they're immediately usable
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    vendors.append(vendor)

print(f"Created {len(vendors)} approved vendors.")


PRODUCTS_PER_VENDOR = (5, 10)  # random range

for vendor in vendors:
    num_products = random.randint(*PRODUCTS_PER_VENDOR)
    for _ in range(num_products):
        category = random.choice(CATEGORIES)
        images = category_images.get(category) or []
        image_url = random.choice(images) if images else None

        product = Product(
            vendor_id=vendor.id,
            name=fake.word().capitalize() + " " + fake.word().capitalize(),
            description=fake.sentence(),
            price=round(random.uniform(100, 5000), 2),  # NPR-ish price range
            stock=random.randint(0, 100),
            image_url=image_url,
            category=category,
        )
        db.add(product)

db.commit()
print("Seeding complete.")

db.close()