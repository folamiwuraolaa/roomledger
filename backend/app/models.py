from datetime import datetime, timezone
from .extensions import db

def utcnow():
    return datetime.now(timezone.utc)

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

class Household(db.Model):
    __tablename__ = "households"
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(160), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

class Membership(db.Model):
    __tablename__ = "memberships"
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    household_id = db.Column(db.String(36), db.ForeignKey("households.id", ondelete="CASCADE"), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="member")
    __table_args__ = (db.UniqueConstraint("user_id", "household_id", name="uq_membership"),)

class Expense(db.Model):
    __tablename__ = "expenses"
    id = db.Column(db.String(36), primary_key=True)
    household_id = db.Column(db.String(36), db.ForeignKey("households.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(160), nullable=False)
    category = db.Column(db.String(40), nullable=False)
    amount = db.Column(db.Integer, nullable=False)  # kobo
    paid_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    created_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    date = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

class ExpenseShare(db.Model):
    __tablename__ = "expense_shares"
    id = db.Column(db.String(36), primary_key=True)
    expense_id = db.Column(db.String(36), db.ForeignKey("expenses.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    amount = db.Column(db.Integer, nullable=False)  # kobo
    __table_args__ = (db.UniqueConstraint("expense_id", "user_id", name="uq_expense_share"),)

class Settlement(db.Model):
    __tablename__ = "settlements"
    id = db.Column(db.String(36), primary_key=True)
    household_id = db.Column(db.String(36), db.ForeignKey("households.id", ondelete="CASCADE"), nullable=False, index=True)
    from_user = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    to_user = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

class Notification(db.Model):
    __tablename__ = "notifications"
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(160), nullable=False)
    body = db.Column(db.String(500), nullable=False)
    read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
