from fastapi import APIRouter

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
def chat_placeholder():
    return {"message": "Chat em construção"}
