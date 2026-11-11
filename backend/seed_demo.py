import sys
sys.path.insert(0, ".")
from app import create_app
from app.extensions import db
from app.models import User, Household, Membership
from werkzeug.security import generate_password_hash
import uuid

app = create_app()
with app.app_context():
    if User.query.filter_by(email="wura@demo.ng").first():
        print("Demo data already exists.")
        raise SystemExit

    users = [
        User(id=str(uuid.uuid4()), name="Wura", email="wura@demo.ng", password_hash=generate_password_hash("demo1234")),
        User(id=str(uuid.uuid4()), name="Tolu", email="tolu@demo.ng", password_hash=generate_password_hash("demo1234")),
        User(id=str(uuid.uuid4()), name="Ada", email="ada@demo.ng", password_hash=generate_password_hash("demo1234")),
        User(id=str(uuid.uuid4()), name="John", email="john@demo.ng", password_hash=generate_password_hash("demo1234")),
    ]
    for u in users: db.session.add(u)
    h = Household(id=str(uuid.uuid4()), name="Maple Dorm", code="MAPLE1")
    db.session.add(h)
    db.session.flush()
    for i, u in enumerate(users):
        db.session.add(Membership(id=str(uuid.uuid4()), user_id=u.id, household_id=h.id, role="admin" if i == 0 else "member"))
    db.session.commit()
    print("Demo account: wura@demo.ng / demo1234")
    print("Household code: MAPLE1")
