from Entity.Donation import Donation
from Entity.FundraisingActivity import FundraisingActivity
class DonationController:
    def __init__(self):
        pass
 
class DonationController:
    def __init__(self):
        pass
 
    def getDonations(
        self,
        donee_id: int,
        keyword: str = "",
        category_id: int | None = None,
        date_from: str = "",
        date_to: str = "",
    ):
        """
        Returns the donee's donation history enriched with FRA and category details.
        """
        # ── Step 1: get raw donations ──────────────────────────────────
        donations = Donation.getByDoneeId(donee_id)
        if not donations:
            return []
 
        # ── Step 2: collect unique fra_ids ────────────────────────────
        fra_ids = list({d["fra_id"] for d in donations if d.get("fra_id") is not None})
 
        # ── Step 3: fetch FRA details in one query ────────────────────
        fra_map = FundraisingActivity.getByIds(fra_ids)   # dict[fra_id -> row]
 
        # ── Step 4: merge ─────────────────────────────────────────────
        merged = []
        for donation in donations:
            row = dict(donation)
            fra = fra_map.get(row["fra_id"], {})
            row.update(fra)          # adds campaign_title, category_name, etc.
            merged.append(row)
 
        # ── Step 5: filter ────────────────────────────────────────────
        if keyword:
            kw = keyword.lower()
            merged = [
                r for r in merged
                if kw in (r.get("campaign_title") or "").lower()
                or kw in (r.get("description") or "").lower()
            ]
 
        if category_id is not None:
            merged = [r for r in merged if r.get("category_id") == category_id]
 
        if date_from:
            merged = [r for r in merged if (r.get("created_at") or "") >= date_from]
 
        if date_to:
            # date_to is YYYY-MM-DD; created_at is "YYYY-MM-DD HH:MM:SS"
            merged = [r for r in merged if (r.get("created_at") or "")[:10] <= date_to]
 
        return merged
 
    def makeDonation(self, donee_id: int, fra_id: int, amount: float):
        return Donation.create(donee_id, fra_id, amount)