import json
import anthropic
from collections import defaultdict
from app.core.config import settings

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def compute_aggregates(transactions: list) -> dict:
    """
    Pure Python computation — faster than extra DB round-trips and easier to explain.
    We derive everything an LLM needs from the raw transaction list.
    """
    total_income  = 0.0
    total_expense = 0.0
    category_totals: dict[str, float] = defaultdict(float)
    daily_totals:    dict[str, float] = defaultdict(float)
    biggest_expense = None

    for txn in transactions:
        if txn.type == "income":
            total_income += txn.amount
        else:
            total_expense += txn.amount
            cat = txn.category or "Uncategorized"
            category_totals[cat] += txn.amount
            daily_totals[str(txn.date)] += txn.amount

            if biggest_expense is None or txn.amount > biggest_expense["amount"]:
                biggest_expense = {
                    "amount":   round(txn.amount, 2),
                    "category": cat,
                    "note":     txn.note or "",
                    "date":     str(txn.date),
                }

    top_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)[:5]
    busiest_day    = max(daily_totals.items(), key=lambda x: x[1]) if daily_totals else None

    return {
        "total_income":  round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "net_savings":   round(total_income - total_expense, 2),
        "savings_rate":  round((total_income - total_expense) / total_income * 100, 1)
                         if total_income > 0 else 0,
        "top_categories": [
            {
                "category": cat,
                "amount":   round(amt, 2),
                "pct":      round(amt / total_expense * 100, 1) if total_expense > 0 else 0,
            }
            for cat, amt in top_categories
        ],
        "biggest_expense":   biggest_expense,
        "busiest_day":       {"date": busiest_day[0], "amount": round(busiest_day[1], 2)}
                             if busiest_day else None,
        "transaction_count": len(transactions),
    }


def generate_report(aggregates: dict, start_date: str, end_date: str) -> dict:
    """
    Sends the pre-computed aggregates to Claude and gets back a structured report.

    We ask Claude to return raw JSON so we can forward it directly to the frontend
    without any fragile string parsing.
    """
    top_cats_text = "\n".join(
        f"  - {c['category']}: ₹{c['amount']:,.0f} ({c['pct']}% of total expenses)"
        for c in aggregates["top_categories"]
    )

    biggest = aggregates["biggest_expense"]
    biggest_text = (
        f"₹{biggest['amount']:,.0f} on {biggest['category']} on {biggest['date']}"
        f"{' (' + biggest['note'] + ')' if biggest['note'] else ''}"
        if biggest else "None"
    )

    busiest = aggregates["busiest_day"]
    busiest_text = (
        f"₹{busiest['amount']:,.0f} on {busiest['date']}" if busiest else "None"
    )

    prompt = f"""You are a friendly personal finance advisor for an Indian user of the Batua money manager app.
Analyze the spending data below and produce a report.

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

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    return json.loads(message.content[0].text.strip())
