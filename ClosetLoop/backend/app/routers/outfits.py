from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, ClosetItem
from ..schemas import OutfitRequest
from ..security import get_current_user

router = APIRouter(prefix="/outfits", tags=["AI Outfit"])

@router.get("")
def list_outfits():
    return {"items": [], "message": "Generated outfits are returned by /outfits/generate in this demo."}

@router.post("/generate")
def generate_outfit(
    data: OutfitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(ClosetItem).filter(ClosetItem.owner_id == current_user.id).all()
    def pick(category, preferred_style=None):
        choices = [x for x in items if x.category == category]
        if preferred_style:
            styled = [x for x in choices if x.style.lower() == preferred_style.lower()]
            if styled:
                choices = styled
        return choices[0] if choices else None

    top = pick("top", data.style)
    bottom = pick("bottom", data.style)
    shoes = pick("shoes", data.style)
    dress = pick("dress", data.style)

    selected = []
    if dress:
        selected.append(dress)
    else:
        for x in (top, bottom):
            if x: selected.append(x)
    if shoes:
        selected.append(shoes)

    if not selected:
        selected = items[:3]

    return {
        "message": "AI outfit generated",
        "mode": "rule-based demo AI",
        "occasion": data.occasion,
        "style": data.style,
        "weather": data.weather,
        "items": [
            {"id": x.id, "name": x.name, "category": x.category, "color": x.color, "image_url": x.image_url}
            for x in selected
        ],
        "tip": f"Try this {data.style} look for {data.occasion}."
    }
