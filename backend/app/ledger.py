from collections import defaultdict


def _member_id(member):
    return member.user_id if hasattr(member, "user_id") else member.id


def net_balances(members, expenses, settlements):
    balances = {_member_id(member): 0 for member in members}

    for expense in expenses:
        balances[expense.paid_by] = balances.get(expense.paid_by, 0) + expense.amount
        for share in expense.shares:
            balances[share.user_id] = balances.get(share.user_id, 0) - share.amount

    for settlement in settlements:
        balances[settlement.from_user] = balances.get(settlement.from_user, 0) + settlement.amount
        balances[settlement.to_user] = balances.get(settlement.to_user, 0) - settlement.amount

    return balances


def pairwise_debts(expenses, settlements):
    pairs = defaultdict(int)

    def add(frm, to, amount):
        if frm == to:
            return
        first, second = sorted([frm, to])
        pairs[(first, second)] += amount if frm == first else -amount

    for expense in expenses:
        for share in expense.shares:
            add(share.user_id, expense.paid_by, share.amount)

    for settlement in settlements:
        add(settlement.to_user, settlement.from_user, settlement.amount)

    debts = []
    for (first, second), value in pairs.items():
        if value > 0:
            debts.append({"from": first, "to": second, "amount": value})
        elif value < 0:
            debts.append({"from": second, "to": first, "amount": -value})

    return sorted(debts, key=lambda debt: debt["amount"], reverse=True)


def equal_split(total, participants):
    if not participants:
        return {}
    base, remainder = divmod(total, len(participants))
    return {user_id: base + (1 if index < remainder else 0) for index, user_id in enumerate(participants)}
