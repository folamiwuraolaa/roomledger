import os
import uuid
from datetime import datetime, timezone
from io import BytesIO
from flask import Blueprint, jsonify, request, session, send_file
from werkzeug.security import generate_password_hash, check_password_hash
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from .extensions import db
from .models import User, Household, Membership, Expense, ExpenseShare, Settlement, Notification
from .ledger import net_balances, pairwise_debts, equal_split

api = Blueprint("api", __name__)

CATEGORIES = {"groceries","electricity","water","internet","gas","cleaning","household","transportation","other"}

def uid():
    return str(uuid.uuid4())

def now():
    return datetime.now(timezone.utc)

def error(message, status=400):
    return jsonify({"error": message}), status

def current_user():
    uid_ = session.get("user_id")
    return db.session.get(User, uid_) if uid_ else None

def membership_for(user_id, household_id):
    return Membership.query.filter_by(user_id=user_id, household_id=household_id).first()

def current_household(user):
    m = Membership.query.filter_by(user_id=user.id).first()
    return (db.session.get(Household, m.household_id), m) if m else (None, None)

def require_user():
    user = current_user()
    if not user:
        return None, error("Please log in.", 401)
    return user, None

def member_ids(household_id):
    return {m.user_id for m in Membership.query.filter_by(household_id=household_id).all()}

def serialize_state(user):
    h, my_membership = current_household(user)
    if not h:
        return {"user": {"id": user.id, "name": user.name, "email": user.email}, "household": None, "expenses": [], "settlements": [], "notifications": []}
    memberships = Membership.query.filter_by(household_id=h.id).all()
    members = []
    for m in memberships:
        u = db.session.get(User, m.user_id)
        members.append({"id": u.id, "name": u.name, "role": m.role})
    expenses = Expense.query.filter_by(household_id=h.id).order_by(Expense.date.desc()).all()
    expense_out = []
    for e in expenses:
        shares = {s.user_id: s.amount for s in ExpenseShare.query.filter_by(expense_id=e.id).all()}
        expense_out.append({"id": e.id, "title": e.title, "category": e.category, "amount": e.amount, "paidBy": e.paid_by, "shares": shares, "date": e.date.isoformat(), "createdBy": e.created_by})
    settlements = Settlement.query.filter_by(household_id=h.id).order_by(Settlement.date.desc()).all()
    settlement_out = [{"id": s.id, "from": s.from_user, "to": s.to_user, "amount": s.amount, "date": s.date.isoformat()} for s in settlements]
    notifications = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc()).limit(50).all()
    return {
        "user": {"id": user.id, "name": user.name, "email": user.email},
        "household": {"id": h.id, "name": h.name, "code": h.code, "members": members, "myRole": my_membership.role},
        "expenses": expense_out,
        "settlements": settlement_out,
        "notifications": [{"id": n.id, "title": n.title, "body": n.body, "read": n.read, "createdAt": n.created_at.isoformat()} for n in notifications],
    }

@api.get("/health")
def health():
    return jsonify({"status": "ok", "service": "roommate-ledger-api"})

@api.post("/auth/register")
def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name","")).strip()
    email = str(data.get("email","")).strip().lower()
    password = str(data.get("password",""))
    if len(name) < 2: return error("Please enter your full name.")
    if "@" not in email: return error("Please enter a valid email address.")
    if len(password) < 8: return error("Password must be at least 8 characters.")
    if User.query.filter_by(email=email).first(): return error("An account with this email already exists.", 409)
    u = User(id=uid(), name=name, email=email, password_hash=generate_password_hash(password))
    db.session.add(u); db.session.commit()
    session.clear(); session["user_id"] = u.id
    return jsonify(serialize_state(u)), 201

@api.post("/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email","")).strip().lower()
    password = str(data.get("password",""))
    u = User.query.filter_by(email=email).first()
    if not u or not check_password_hash(u.password_hash, password):
        return error("That email and password don't match. Please try again.", 401)
    session.clear(); session["user_id"] = u.id
    return jsonify(serialize_state(u))

@api.post("/auth/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})

@api.get("/state")
def state():
    u, err = require_user()
    if err: return err
    return jsonify(serialize_state(u))

@api.post("/households")
def create_household():
    u, err = require_user()
    if err: return err
    data = request.get_json(silent=True) or {}
    name = str(data.get("name","")).strip()
    if len(name) < 2: return error("Please enter a household name.")
    existing, _ = current_household(u)
    if existing: return error("You already belong to a household.", 409)
    code = uuid.uuid4().hex[:6].upper()
    while Household.query.filter_by(code=code).first():
        code = uuid.uuid4().hex[:6].upper()
    h = Household(id=uid(), name=name, code=code)
    db.session.add(h)
    db.session.add(Membership(id=uid(), user_id=u.id, household_id=h.id, role="admin"))
    db.session.commit()
    return jsonify(serialize_state(u)), 201

@api.post("/households/join")
def join_household():
    u, err = require_user()
    if err: return err
    data = request.get_json(silent=True) or {}
    code = str(data.get("code","")).strip().upper()
    h = Household.query.filter_by(code=code).first()
    if not h: return error("We couldn't find a household with that invite code.", 404)
    if membership_for(u.id, h.id): return jsonify(serialize_state(u))
    if membership_for(u.id, h.id): return error("You are already a member.")
    existing, _ = current_household(u)
    if existing: return error("You already belong to a household.", 409)
    db.session.add(Membership(id=uid(), user_id=u.id, household_id=h.id, role="member"))
    db.session.commit()
    return jsonify(serialize_state(u))

def require_household_member(u):
    h, m = current_household(u)
    if not h: return None, None, error("Join or create a household first.", 409)
    return h, m, None

@api.post("/expenses")
def add_expense():
    u, err = require_user()
    if err: return err
    h, my_m, err = require_household_member(u)
    if err: return err
    data = request.get_json(silent=True) or {}
    title = str(data.get("title","")).strip()
    category = str(data.get("category","other")).strip()
    amount = data.get("amount")
    paid_by = str(data.get("paidBy",""))
    shares = data.get("shares") or {}
    if not title: return error("Please give this expense a name.")
    if category not in CATEGORIES: return error("Please choose a valid category.")
    try: amount = int(amount)
    except (TypeError, ValueError): return error("Please enter a valid amount.")
    if amount <= 0: return error("Amount must be greater than zero.")
    ids = member_ids(h.id)
    if paid_by not in ids: return error("The selected payer is not in this household.")
    try:
        shares = {str(k): int(v) for k,v in shares.items()}
    except (TypeError, ValueError): return error("Invalid split amounts.")
    if not shares or any(k not in ids or v <= 0 for k,v in shares.items()):
        return error("Please select valid participants and shares.")
    if sum(shares.values()) != amount:
        return error("The participant shares must add up exactly to the expense amount.")
    e = Expense(id=uid(), household_id=h.id, title=title, category=category, amount=amount, paid_by=paid_by, created_by=u.id, date=now())
    db.session.add(e)
    for member_id, share in shares.items():
        db.session.add(ExpenseShare(id=uid(), expense_id=e.id, user_id=member_id, amount=share))
    payer = db.session.get(User, paid_by)
    for member_id in shares:
        if member_id != paid_by:
            db.session.add(Notification(id=uid(), user_id=member_id, title="New shared expense", body=f"{u.name} added {title} — your share is ₦{shares[member_id]/100:,.2f}." if shares[member_id] % 100 else f"{u.name} added {title} — your share is ₦{shares[member_id]/100:,.0f}."))
    db.session.commit()
    return jsonify({"id": e.id, **serialize_state(u)}), 201

@api.delete("/expenses/<expense_id>")
def delete_expense(expense_id):
    u, err = require_user()
    if err: return err
    h, my_m, err = require_household_member(u)
    if err: return err
    e = db.session.get(Expense, expense_id)
    if not e or e.household_id != h.id: return error("Expense not found.", 404)
    if e.created_by != u.id and my_m.role != "admin": return error("You are not allowed to delete this expense.", 403)
    db.session.delete(e); db.session.commit()
    return jsonify(serialize_state(u))

@api.post("/settlements")
def settle():
    u, err = require_user()
    if err: return err
    h, my_m, err = require_household_member(u)
    if err: return err
    data = request.get_json(silent=True) or {}
    to = str(data.get("to",""))
    try: amount = int(data.get("amount"))
    except (TypeError, ValueError): return error("Please enter a valid amount.")
    if amount <= 0 or to == u.id: return error("Invalid settlement.")
    ids = member_ids(h.id)
    if to not in ids: return error("The recipient is not in your household.")
    debts = pairwise_debts(Expense.query.filter_by(household_id=h.id).all(), Settlement.query.filter_by(household_id=h.id).all())
    owed = next((d["amount"] for d in debts if d["from"] == u.id and d["to"] == to), 0)
    if amount > owed: return error("You cannot settle more than the outstanding balance.", 400)
    s = Settlement(id=uid(), household_id=h.id, from_user=u.id, to_user=to, amount=amount, date=now())
    db.session.add(s)
    receiver = db.session.get(User, to)
    db.session.add(Notification(id=uid(), user_id=to, title="Settlement recorded", body=f"{u.name} recorded a settlement of ₦{amount/100:,.2f} with you." if amount % 100 else f"{u.name} recorded a settlement of ₦{amount/100:,.0f} with you."))
    db.session.commit()
    return jsonify({"id": s.id, **serialize_state(u)}), 201

@api.post("/notifications/<notification_id>/read")
def mark_notification_read(notification_id):
    u, err = require_user()
    if err: return err
    n = db.session.get(Notification, notification_id)
    if not n or n.user_id != u.id: return error("Notification not found.", 404)
    n.read = True
    db.session.commit()
    return jsonify({"ok": True})

@api.post("/notifications/read-all")
def mark_all_notifications_read():
    u, err = require_user()
    if err: return err
    Notification.query.filter_by(user_id=u.id, read=False).update({"read": True})
    db.session.commit()
    return jsonify({"ok": True})

@api.patch("/household/members/<member_id>/role")
def set_role(member_id):
    u, err = require_user()
    if err: return err
    h, my_m, err = require_household_member(u)
    if err: return err
    if my_m.role != "admin": return error("Only household admins can change member roles.", 403)
    if member_id == u.id: return error("You cannot change your own role.")
    m = membership_for(member_id, h.id)
    if not m: return error("Member not found.", 404)
    data = request.get_json(silent=True) or {}
    role = data.get("role")
    if role not in ("admin","member"): return error("Invalid role.")
    m.role = role
    db.session.commit()
    return jsonify(serialize_state(u))

@api.delete("/household/members/<member_id>")
def remove_member(member_id):
    u, err = require_user()
    if err: return err
    h, my_m, err = require_household_member(u)
    if err: return err
    if my_m.role != "admin": return error("Only household admins can remove members.", 403)
    if member_id == u.id: return error("You cannot remove yourself.")
    m = membership_for(member_id, h.id)
    if not m: return error("Member not found.", 404)
    expenses = Expense.query.filter_by(household_id=h.id).all()
    settlements = Settlement.query.filter_by(household_id=h.id).all()
    balances = net_balances(Membership.query.filter_by(household_id=h.id).all(), expenses, settlements)
    if balances.get(member_id, 0) != 0: return error("This member still has an open balance. Settle it before removing them.", 409)
    db.session.delete(m); db.session.commit()
    return jsonify(serialize_state(u))

@api.get("/expenses/<expense_id>/receipt")
def expense_receipt(expense_id):
    u, err = require_user()
    if err: return err
    h, _, err = require_household_member(u)
    if err: return err
    e = db.session.get(Expense, expense_id)
    if not e or e.household_id != h.id: return error("Expense not found.", 404)
    shares = ExpenseShare.query.filter_by(expense_id=e.id).all()
    buf = BytesIO()
    pdf = canvas.Canvas(buf, pagesize=A4)
    y = 800
    pdf.setFont("Helvetica-Bold", 18); pdf.drawString(50, y, "ROOMMATE LEDGER"); y -= 35
    pdf.setFont("Helvetica-Bold", 14); pdf.drawString(50, y, "Expense Receipt"); y -= 25
    pdf.setFont("Helvetica", 10); pdf.drawString(50, y, f"Expense ID: {e.id}"); y -= 20
    pdf.drawString(50, y, f"Expense: {e.title}"); y -= 20
    pdf.drawString(50, y, f"Category: {e.category.title()}"); y -= 20
    pdf.drawString(50, y, f"Amount: N{e.amount/100:,.2f}"); y -= 20
    payer = db.session.get(User, e.paid_by)
    pdf.drawString(50, y, f"Paid by: {payer.name}"); y -= 30
    pdf.setFont("Helvetica-Bold", 11); pdf.drawString(50, y, "Participants"); y -= 20
    pdf.setFont("Helvetica", 10)
    for s in shares:
        member = db.session.get(User, s.user_id)
        pdf.drawString(65, y, f"{member.name}: N{s.amount/100:,.2f}"); y -= 18
    pdf.showPage(); pdf.save(); buf.seek(0)
    return send_file(buf, mimetype="application/pdf", as_attachment=True, download_name=f"expense-{e.id}.pdf")

@api.get("/settlements/<settlement_id>/receipt")
def settlement_receipt(settlement_id):
    u, err = require_user()
    if err: return err
    h, _, err = require_household_member(u)
    if err: return err
    s = db.session.get(Settlement, settlement_id)
    if not s or s.household_id != h.id: return error("Settlement not found.", 404)
    frm, to = db.session.get(User, s.from_user), db.session.get(User, s.to_user)
    buf = BytesIO()
    pdf = canvas.Canvas(buf, pagesize=A4)
    y = 800
    pdf.setFont("Helvetica-Bold", 18); pdf.drawString(50, y, "ROOMMATE LEDGER"); y -= 35
    pdf.setFont("Helvetica-Bold", 14); pdf.drawString(50, y, "Settlement Receipt"); y -= 25
    pdf.setFont("Helvetica", 10); pdf.drawString(50, y, f"Settlement ID: {s.id}"); y -= 20
    pdf.drawString(50, y, f"From: {frm.name}"); y -= 20
    pdf.drawString(50, y, f"To: {to.name}"); y -= 20
    pdf.drawString(50, y, f"Amount: N{s.amount/100:,.2f}"); y -= 20
    pdf.drawString(50, y, f"Date: {s.date.isoformat()}"); y -= 20
    pdf.drawString(50, y, "Status: SETTLED")
    pdf.showPage(); pdf.save(); buf.seek(0)
    return send_file(buf, mimetype="application/pdf", as_attachment=True, download_name=f"settlement-{s.id}.pdf")
