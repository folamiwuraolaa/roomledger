from collections import defaultdict

def net_balances(members, expenses, settlements):
    bal = {(m.user_id if hasattr(m, "user_id") else m.id): 0 for m in members}
    for e in expenses:
        bal[e.paid_by] = bal.get(e.paid_by, 0) + e.amount
        for s in e.shares:
            bal[s.user_id] = bal.get(s.user_id, 0) - s.amount
    for s in settlements:
        bal[s.from_user] = bal.get(s.from_user, 0) + s.amount
        bal[s.to_user] = bal.get(s.to_user, 0) - s.amount
    return bal

def pairwise_debts(expenses, settlements):
    pairs = defaultdict(int)
    def add(frm, to, amount):
        if frm == to:
            return
        a, b = sorted([frm, to])
        pairs[(a,b)] += amount if frm == a else -amount

    for e in expenses:
        for share in e.shares:
            add(share.user_id, e.paid_by, share.amount)

    for s in settlements:
        add(s.to_user, s.from_user, s.amount)

    debts = []
    for (a,b), value in pairs.items():
        if value > 0:
            debts.append({"from": a, "to": b, "amount": value})
        elif value < 0:
            debts.append({"from": b, "to": a, "amount": -value})
    return sorted(debts, key=lambda x: x["amount"], reverse=True)

def equal_split(total, participants):
    if not participants:
        return {}
    base, rem = divmod(total, len(participants))
    return {uid: base + (1 if i < rem else 0) for i, uid in enumerate(participants)}
