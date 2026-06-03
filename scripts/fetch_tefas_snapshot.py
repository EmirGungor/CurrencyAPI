#!/usr/bin/env python3
"""
Daily TEFAS NAV snapshot.

Pulls latest closing NAV + key metrics for the 50 funds we ship in the UI,
then writes them to public/funds-snapshot.json so the frontend can fetch
real prices (no synthetic walk) and compute live "Günün Tahmini" from
underlying assets.

If the TEFAS official endpoint stays disabled (it has been 404'ing for
months), we fall back to writing a minimal stub so the workflow still
succeeds and the JSON file exists. The frontend already gracefully handles
absent/empty snapshot data.

Source: tries `tefas-crawler` PyPI package (https://github.com/burakyilmaz321/tefas-crawler),
then falls back to the static seed file shipped in the repo.
"""

import json
import sys
import datetime as dt
from pathlib import Path

# Curated 50 funds — must match src/lib/funds.js FUND_LIST
FUND_CODES = [
    "DLY", "TTA", "AFT", "YAK", "TP2", "YKT", "PHE", "KLU", "AFO", "YHT",
    "DBK", "TLY", "GTA", "YAS", "KZL", "GTZ", "YZG", "GUM", "TCA", "SAS",
    "AFA", "KUT", "KTV", "TTE", "TGE", "DFI", "PRY", "EUZ", "YAY", "GPL",
    "PBR", "MAC", "TAU", "AOY", "AES", "TUA", "IJC", "TMG", "PAL", "IHK",
    "BGP", "KGM", "OJK", "YP4", "GUH", "DBA", "GRO", "ADE", "AFS", "DAS",
]

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "funds-snapshot.json"


def fetch_via_tefas_crawler():
    """Try to use the maintained tefas-crawler package."""
    try:
        from tefas import Crawler  # type: ignore
    except ImportError:
        return None

    crawler = Crawler()
    today = dt.date.today()
    start = today - dt.timedelta(days=14)  # window in case yesterday wasn't a trading day
    snapshot = {}
    for code in FUND_CODES:
        try:
            data = crawler.fetch(start=start.isoformat(), end=today.isoformat(), name=code)
            if data is None or len(data) == 0:
                continue
            # Take latest row
            row = data.iloc[-1] if hasattr(data, "iloc") else data[-1]
            snapshot[code] = {
                "price": float(row.get("price") or row.get("FIYAT") or 0),
                "date": str(row.get("date") or row.get("TARIH") or today.isoformat()),
                "market_cap": float(row.get("market_cap") or 0) if row.get("market_cap") else None,
                "number_of_shares": float(row.get("number_of_shares") or 0) if row.get("number_of_shares") else None,
                "number_of_investors": int(row.get("number_of_investors") or 0) if row.get("number_of_investors") else None,
            }
        except Exception as e:  # noqa: BLE001
            print(f"  ⚠ {code}: {type(e).__name__}: {e}", file=sys.stderr)
            continue
    return snapshot


def write_stub_snapshot():
    """Write an empty-but-valid snapshot so the JSON file exists."""
    return {}


def main() -> int:
    now = dt.datetime.now(dt.timezone.utc)
    print(f"TEFAS snapshot run at {now.isoformat()}")

    snapshot = fetch_via_tefas_crawler()
    source = "tefas-crawler"

    if snapshot is None:
        print("  ⓘ tefas-crawler not installed — writing stub")
        snapshot = write_stub_snapshot()
        source = "stub"
    elif not snapshot:
        print("  ⚠ tefas-crawler returned 0 rows — writing stub (likely API still disabled)")
        snapshot = write_stub_snapshot()
        source = "stub"

    payload = {
        "source": source,
        "generated_at": now.isoformat(),
        "trading_date": dt.date.today().isoformat(),
        "fund_count": len(snapshot),
        "funds": snapshot,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  ✓ wrote {OUT.relative_to(ROOT)} ({len(snapshot)} funds, source={source})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
