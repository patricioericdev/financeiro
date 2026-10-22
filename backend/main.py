from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import defaultdict
from database import (
    get_db, create_tables, seed_data,
    Category, Transaction, Budget
)

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

create_tables()
seed_data()


# ─── CATEGORIES ────────────────────────────────────────────────────────────────

@app.get("/api/categories/")
def list_categories():
    db = get_db()
    try:
        return jsonify([c.to_dict() for c in db.query(Category).all()])
    finally:
        db.close()


@app.post("/api/categories/")
def create_category():
    db = get_db()
    try:
        data = request.json
        cat = Category(
            name=data["name"], type=data["type"],
            color=data.get("color", "#6b7280"), icon=data.get("icon", "📦")
        )
        db.add(cat)
        db.commit()
        db.refresh(cat)
        return jsonify(cat.to_dict()), 201
    finally:
        db.close()


@app.put("/api/categories/<int:cid>")
def update_category(cid):
    db = get_db()
    try:
        cat = db.query(Category).filter(Category.id == cid).first()
        if not cat:
            return jsonify({"error": "Not found"}), 404
        data = request.json
        for field in ("name", "type", "color", "icon"):
            if field in data:
                setattr(cat, field, data[field])
        db.commit()
        db.refresh(cat)
        return jsonify(cat.to_dict())
    finally:
        db.close()


@app.delete("/api/categories/<int:cid>")
def delete_category(cid):
    db = get_db()
    try:
        cat = db.query(Category).filter(Category.id == cid).first()
        if not cat:
            return jsonify({"error": "Not found"}), 404
        db.delete(cat)
        db.commit()
        return jsonify({"ok": True})
    finally:
        db.close()


# ─── TRANSACTIONS ───────────────────────────────────────────────────────────────

@app.get("/api/transactions/")
def list_transactions():
    db = get_db()
    try:
        month = request.args.get("month", type=int)
        year = request.args.get("year", type=int)
        type_ = request.args.get("type")
        category_id = request.args.get("category_id", type=int)

        q = db.query(Transaction)
        if month and year:
            q = q.filter(Transaction.date.startswith(f"{year}-{month:02d}"))
        elif month:
            q = q.filter(Transaction.date.contains(f"-{month:02d}-"))
        elif year:
            q = q.filter(Transaction.date.startswith(str(year)))
        if type_:
            q = q.filter(Transaction.type == type_)
        if category_id:
            q = q.filter(Transaction.category_id == category_id)

        return jsonify([t.to_dict() for t in q.order_by(Transaction.date.desc()).all()])
    finally:
        db.close()


@app.post("/api/transactions/")
def create_transaction():
    db = get_db()
    try:
        data = request.json
        tx = Transaction(
            description=data["description"], amount=float(data["amount"]),
            type=data["type"], category_id=data.get("category_id"),
            date=data["date"], notes=data.get("notes")
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)
        return jsonify(db.query(Transaction).filter(Transaction.id == tx.id).first().to_dict()), 201
    finally:
        db.close()


@app.put("/api/transactions/<int:tid>")
def update_transaction(tid):
    db = get_db()
    try:
        tx = db.query(Transaction).filter(Transaction.id == tid).first()
        if not tx:
            return jsonify({"error": "Not found"}), 404
        data = request.json
        for field in ("description", "amount", "type", "category_id", "date", "notes"):
            if field in data:
                setattr(tx, field, data[field])
        db.commit()
        return jsonify(db.query(Transaction).filter(Transaction.id == tid).first().to_dict())
    finally:
        db.close()


@app.delete("/api/transactions/<int:tid>")
def delete_transaction(tid):
    db = get_db()
    try:
        tx = db.query(Transaction).filter(Transaction.id == tid).first()
        if not tx:
            return jsonify({"error": "Not found"}), 404
        db.delete(tx)
        db.commit()
        return jsonify({"ok": True})
    finally:
        db.close()


# ─── BUDGETS ────────────────────────────────────────────────────────────────────

@app.get("/api/budgets/")
def list_budgets():
    db = get_db()
    try:
        month = request.args.get("month", type=int)
        year = request.args.get("year", type=int)
        q = db.query(Budget)
        if month:
            q = q.filter(Budget.month == month)
        if year:
            q = q.filter(Budget.year == year)
        return jsonify([b.to_dict() for b in q.all()])
    finally:
        db.close()


@app.post("/api/budgets/")
def create_budget():
    db = get_db()
    try:
        data = request.json
        b = Budget(
            category_id=int(data["category_id"]), month=int(data["month"]),
            year=int(data["year"]), limit_amount=float(data["limit_amount"])
        )
        db.add(b)
        db.commit()
        db.refresh(b)
        return jsonify(db.query(Budget).filter(Budget.id == b.id).first().to_dict()), 201
    finally:
        db.close()


@app.put("/api/budgets/<int:bid>")
def update_budget(bid):
    db = get_db()
    try:
        b = db.query(Budget).filter(Budget.id == bid).first()
        if not b:
            return jsonify({"error": "Not found"}), 404
        data = request.json
        for field in ("limit_amount", "month", "year"):
            if field in data:
                setattr(b, field, data[field])
        db.commit()
        db.refresh(b)
        return jsonify(db.query(Budget).filter(Budget.id == bid).first().to_dict())
    finally:
        db.close()


@app.delete("/api/budgets/<int:bid>")
def delete_budget(bid):
    db = get_db()
    try:
        b = db.query(Budget).filter(Budget.id == bid).first()
        if not b:
            return jsonify({"error": "Not found"}), 404
        db.delete(b)
        db.commit()
        return jsonify({"ok": True})
    finally:
        db.close()


# ─── DASHBOARD ──────────────────────────────────────────────────────────────────

@app.get("/api/dashboard")
def dashboard():
    db = get_db()
    try:
        month = request.args.get("month", type=int)
        year = request.args.get("year", type=int)

        q = db.query(Transaction)
        if month and year:
            q = q.filter(Transaction.date.startswith(f"{year}-{month:02d}"))

        txs = q.all()
        total_income = sum(t.amount for t in txs if t.type == "income")
        total_expense = sum(t.amount for t in txs if t.type == "expense")

        bq = db.query(Budget)
        if month:
            bq = bq.filter(Budget.month == month)
        if year:
            bq = bq.filter(Budget.year == year)
        budgets = bq.all()

        budgets_summary = []
        for b in budgets:
            spent = sum(t.amount for t in txs if t.category_id == b.category_id and t.type == "expense")
            pct = (spent / b.limit_amount * 100) if b.limit_amount > 0 else 0
            budgets_summary.append({
                "id": b.id,
                "category": b.category.to_dict() if b.category else None,
                "spent": spent, "limit": b.limit_amount,
                "percentage": round(pct, 1),
            })

        cat_data = defaultdict(lambda: {"income": 0, "expense": 0, "name": "", "icon": ""})
        # Categorização para a regra 50/30/20
        # Necessidades (50%): Alimentação, Transporte, Saúde, Casa, Educação
        # Desejos (30%): Lazer, Outros
        # Poupança/Investimentos (20%): Investimentos, ou o saldo acumulado
        needs_categories = {"Alimentação", "Transporte", "Saúde", "Casa", "Educação"}
        wants_categories = {"Lazer", "Outros"}
        
        needs_spent = 0.0
        wants_spent = 0.0
        savings_allocated = 0.0

        for t in txs:
            if t.category:
                cat_data[t.category_id]["name"] = t.category.name
                cat_data[t.category_id]["icon"] = t.category.icon
                cat_data[t.category_id][t.type] += t.amount
                
                if t.type == "expense":
                    cname = t.category.name
                    if cname in needs_categories:
                        needs_spent += t.amount
                    elif cname in wants_categories:
                        wants_spent += t.amount
                    elif cname == "Investimentos":
                        savings_allocated += t.amount
                    else:
                        needs_spent += t.amount

        # Metas calculadas sobre as receitas (ou 0 se não houver receita)
        rule_50_budget = total_income * 0.50
        rule_30_budget = total_income * 0.30
        rule_20_budget = total_income * 0.20

        rule_50_30_20 = {
            "needs": {
                "budget": rule_50_budget,
                "spent": needs_spent,
                "percentage": round((needs_spent / rule_50_budget * 100), 1) if rule_50_budget > 0 else 0
            },
            "wants": {
                "budget": rule_30_budget,
                "spent": wants_spent,
                "percentage": round((wants_spent / rule_30_budget * 100), 1) if rule_30_budget > 0 else 0
            },
            "savings": {
                "budget": rule_20_budget,
                "actual": savings_allocated + max(0, total_income - total_expense),
                "percentage": round(((savings_allocated + max(0, total_income - total_expense)) / rule_20_budget * 100), 1) if rule_20_budget > 0 else 0
            }
        }

        return jsonify({
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": total_income - total_expense,
            "transactions_count": len(txs),
            "budgets_summary": budgets_summary,
            "rule_50_30_20": rule_50_30_20,
            "chart_data": [
                {"name": v["name"], "icon": v["icon"], "receitas": v["income"], "despesas": v["expense"]}
                for v in cat_data.values()
            ],
            "recent_transactions": [
                {"id": t.id, "description": t.description, "amount": t.amount,
                 "type": t.type, "date": t.date,
                 "category": t.category.to_dict() if t.category else None}
                for t in sorted(txs, key=lambda x: x.date, reverse=True)[:5]
            ],
        })
    finally:
        db.close()


if __name__ == "__main__":
    app.run(port=8000, debug=True)
