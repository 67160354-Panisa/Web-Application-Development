import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models import User
from ..schemas import RegisterIn, LoginIn, ChangePasswordIn, TokenOut, UserOut
from ..security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(tags=["Authentication"])

# --- โครงสร้างข้อมูลสำหรับระบบลืมรหัสผ่าน ---
class ForgotPasswordIn(BaseModel):
    email: str

class ResetPasswordIn(BaseModel):
    new_password: str
# ----------------------------------------

@router.post("/register", response_model=TokenOut)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter((User.email == data.email) | (User.username == data.username)).first():
        raise HTTPException(400, "Email or username already exists")
    user = User(
        username=data.username.strip(),
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        display_name=data.display_name.strip() or data.username.strip()
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenOut(access_token=create_access_token(user.id), user=user)

@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == data.email.lower()) | (User.username == data.email)
    ).first()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Invalid email, username, or password")
        
    return TokenOut(access_token=create_access_token(user.id), user=user)

@router.post("/logout")
def logout():
    return {"message": "Logged out. Remove the bearer token on the client."}

@router.post("/change-password")
def change_password(
    data: ChangePasswordIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(400, "Current password is incorrect")
    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

# --- API ใหม่สำหรับรีเซ็ตรหัสผ่าน ---
@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user:
        # เพื่อความปลอดภัย จะไม่บอกว่าไม่มีอีเมลนี้ในระบบ ให้คนนอกเดาไม่ได้
        return {"message": "หากอีเมลนี้มีอยู่ในระบบ ลิงก์รีเซ็ตรหัสผ่านจะถูกส่งไปค่ะ"}
    
    reset_token = create_access_token(user.id)
    reset_link = f"http://localhost:5173/?reset_token={reset_token}"
    
    # ⚠️ แทนที่ด้วยอีเมลและรหัส App Password 16 หลักที่เตรียมไว้
    SENDER_EMAIL = "67160354@go.buu.ac.th"
    SENDER_PASSWORD = "bihvygxirdplwqqd" 
    
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = user.email
        msg['Subject'] = "ตั้งรหัสผ่านใหม่สำหรับ ClosetLoop"
        
        body = f"สวัสดีค่ะ,\n\nกรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่สำหรับบัญชี ClosetLoop ของคุณ:\n\n{reset_link}\n\n(ลิงก์นี้ใช้ได้เพียงครั้งเดียว)"
        msg.attach(MIMEText(body, 'plain'))
        
        # เชื่อมต่อกับเซิร์ฟเวอร์ Gmail แบบเข้ารหัสความปลอดภัย
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return {"message": "ระบบส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณแล้วค่ะ กรุณาตรวจสอบกล่องข้อความ"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="ไม่สามารถส่งอีเมลได้ในขณะนี้ กรุณาลองใหม่อีกครั้งค่ะ")

@router.post("/reset-password")
def reset_password(
    data: ResetPasswordIn,
    current_user: User = Depends(get_current_user), # ดึง User จาก Token ในลิงก์
    db: Session = Depends(get_db)
):
    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว"}