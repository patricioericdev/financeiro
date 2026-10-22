from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime

DATABASE_URL = "sqlite:///./financeiro.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(String)
    color = Column(String, default="#6b7280")
    icon = Column(String, default="📦")
    transactions = relationship("Transaction", back_populates="category")
    budgets = relationship("Budget", back_populates="category")

    def to_dict(self):
        return {"id": self.id, "name": self.name, "type": self.type,
                "color": self.color, "icon": self.icon}


class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    amount = Column(Float)
    type = Column(String)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    date = Column(String)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    category = relationship("Category", back_populates="transactions")

    def to_dict(self):
        return {
            "id": self.id, "description": self.description,
            "amount": self.amount, "type": self.type,
            "category_id": self.category_id, "date": self.date,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "category": self.category.to_dict() if self.category else None,
        }


class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    month = Column(Integer)
    year = Column(Integer)
    limit_amount = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    category = relationship("Category", back_populates="budgets")

    def to_dict(self):
        return {
            "id": self.id, "category_id": self.category_id,
            "month": self.month, "year": self.year,
            "limit_amount": self.limit_amount,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "category": self.category.to_dict() if self.category else None,
        }


def get_db():
    return SessionLocal()


def create_tables():
    Base.metadata.create_all(bind=engine)


def seed_data():
    db = SessionLocal()
    try:
        if db.query(Category).count() == 0:
            cats = [
                Category(name="Salário", type="income", color="#10b981", icon="💼"),
                Category(name="Freelance", type="income", color="#6366f1", icon="💻"),
                Category(name="Investimentos", type="income", color="#f59e0b", icon="📈"),
                Category(name="Alimentação", type="expense", color="#ef4444", icon="🍔"),
                Category(name="Transporte", type="expense", color="#f97316", icon="🚗"),
                Category(name="Saúde", type="expense", color="#ec4899", icon="🏥"),
                Category(name="Lazer", type="expense", color="#8b5cf6", icon="🎮"),
                Category(name="Casa", type="expense", color="#06b6d4", icon="🏠"),
                Category(name="Educação", type="expense", color="#84cc16", icon="📚"),
                Category(name="Outros", type="expense", color="#6b7280", icon="📦"),
            ]
            for c in cats:
                db.add(c)
            db.commit()

        if db.query(Transaction).count() == 0:
            cmap = {c.name: c.id for c in db.query(Category).all()}
            txs = [
                Transaction(description="Salário", amount=5000.0, type="income", category_id=cmap.get("Salário"), date="2026-10-15", notes="Salário mensal"),
                Transaction(description="Supermercado", amount=450.0, type="expense", category_id=cmap.get("Alimentação"), date="2026-10-10", notes="Compras do mês"),
                Transaction(description="Uber", amount=85.0, type="expense", category_id=cmap.get("Transporte"), date="2026-10-12"),
                Transaction(description="Netflix", amount=45.90, type="expense", category_id=cmap.get("Lazer"), date="2026-10-05"),
                Transaction(description="Consulta médica", amount=200.0, type="expense", category_id=cmap.get("Saúde"), date="2026-10-18"),
                Transaction(description="Aluguel", amount=1200.0, type="expense", category_id=cmap.get("Casa"), date="2026-10-01"),
                Transaction(description="Freelance projeto", amount=1500.0, type="income", category_id=cmap.get("Freelance"), date="2026-10-08"),
            ]
            for t in txs:
                db.add(t)
            db.commit()

        if db.query(Budget).count() == 0:
            cmap = {c.name: c.id for c in db.query(Category).all()}
            budgets = [
                Budget(category_id=cmap["Alimentação"], month=10, year=2026, limit_amount=600.0),
                Budget(category_id=cmap["Transporte"], month=10, year=2026, limit_amount=200.0),
                Budget(category_id=cmap["Lazer"], month=10, year=2026, limit_amount=300.0),
                Budget(category_id=cmap["Casa"], month=10, year=2026, limit_amount=1300.0),
                Budget(category_id=cmap["Saúde"], month=10, year=2026, limit_amount=400.0),
            ]
            for b in budgets:
                db.add(b)
            db.commit()
    finally:
        db.close()
