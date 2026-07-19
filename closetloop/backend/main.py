from fastapi import FastAPI

app = FastAPI()

# เมื่อมีคนเรียกมาที่หน้าแรก ให้ส่งข้อความทักทายกลับไป
@app.get("/")
def read_root():
    return {"message": "สวัสดีครับ! ห้องครัวหลังบ้าน ClosetLoop พร้อมทำงานแล้ว"}