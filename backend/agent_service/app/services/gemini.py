import json
import pandas as pd
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from app.core.config import settings

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.3,
)


def compute_aggregates(transactions: list) -> dict:
    """
    Uses pandas for all aggregations — cleaner than Python loops and easy to extend
    with rolling averages or outlier detection later.
    """
    records = [
        {
            "amount":   txn.amount,
            "type":     txn.type,
            "category": txn.category or "Uncategorized",
            "date":     str(txn.date),
            "note":     txn.note or "",
        }
        for txn in transactions
    ]

    df       = pd.DataFrame(records)
    expenses = df[df["type"] == "expense"]
    income   = df[df["type"] == "income"]

    total_income  = float(income["amount"].sum())
    total_expense = float(expenses["amount"].sum())
    net_savings   = total_income - total_expense

    # Top 5 expense categories
    cat_totals = (
        expenses.groupby("category")["amount"]
        .sum()
        .sort_values(ascending=False)
        .head(5)
    )
    top_categories = [
        {
            "category": cat,
            "amount":   round(float(amt), 2),
            "pct":      round(float(amt) / total_expense * 100, 1) if total_expense > 0 else 0,
        }
        for cat, amt in cat_totals.items()
    ]

    # Biggest single expense
    biggest_expense = None
    if not expenses.empty:
        row = expenses.loc[expenses["amount"].idxmax()]
        biggest_expense = {
            "amount":   round(float(row["amount"]), 2),
            "category": row["category"],
            "note":     row["note"],
            "date":     row["date"],
        }

    # Day with most spending
    busiest_day = None
    if not expenses.empty:
        day_totals  = expenses.groupby("date")["amount"].sum()
        top_day     = day_totals.idxmax()
        busiest_day = {"date": top_day, "amount": round(float(day_totals[top_day]), 2)}

    return {
        "total_income":      round(total_income,  2),
        "total_expense":     round(total_expense, 2),
        "net_savings":       round(net_savings,   2),
        "savings_rate":      round(net_savings / total_income * 100, 1) if total_income > 0 else 0,
        "top_categories":    top_categories,
        "biggest_expense":   biggest_expense,
        "busiest_day":       busiest_day,
        "transaction_count": len(transactions),
    }


def generate_report(aggregates: dict, start_date: str, end_date: str) -> dict:
    """
    Sends pre-computed aggregates to Gemini via LangChain and returns a
    structured JSON report — narrative, insights, and an actionable tip.
    """
    top_cats_text = "\n".join(
        f"  - {c['category']}: ₹{c['amount']:,.0f} ({c['pct']}% of total expenses)"
        for c in aggregates["top_categories"]
    )

    biggest      = aggregates["biggest_expense"]
    biggest_text = (
        f"₹{biggest['amount']:,.0f} on {biggest['category']} on {biggest['date']}"
        + (f" ({biggest['note']})" if biggest["note"] else "")
        if biggest else "None"
    )

    busiest      = aggregates["busiest_day"]
    busiest_text = f"₹{busiest['amount']:,.0f} on {busiest['date']}" if busiest else "None"

    prompt = f"""You are a friendly personal finance advisor for an Indian user of the Batua money manager app.
Analyse the spending data below and produce a report.

Period: {start_date} to {end_date}
Total Income:    ₹{aggregates['total_income']:,.0f}
Total Expenses:  ₹{aggregates['total_expense']:,.0f}
Net Savings:     ₹{aggregates['net_savings']:,.0f}
Savings Rate:    {aggregates['savings_rate']}%
Transactions:    {aggregates['transaction_count']}

Top Expense Categories:
{top_cats_text}

Biggest Single Expense: {biggest_text}
Busiest Spending Day:   {busiest_text}

Reply with ONLY a raw JSON object — no markdown, no code fences. Use this exact structure:
{{
  "narrative": "2–3 paragraph conversational summary. Be specific with rupee amounts. Be warm and direct, not preachy.",
  "insights": [
    "specific insight backed by the numbers",
    "specific insight backed by the numbers",
    "specific insight backed by the numbers",
    "specific insight backed by the numbers"
  ],
  "tip": "One concrete, actionable money-saving suggestion based on their biggest spending category."
}}"""

    response = llm.invoke([HumanMessage(content=prompt)])
    text     = response.content.strip()

    # Gemini sometimes wraps output in ```json ... ``` — strip it defensively
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]

    return json.loads(text.strip())
