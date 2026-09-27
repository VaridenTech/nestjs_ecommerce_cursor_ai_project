# Auth Spec — สัญญาที่เราออกแบบเอง (ไม่มี client ตัวไหนบังคับ)

ต่างจาก api-spec.md ตรงที่ไฟล์นั้นถอดมาจากโค้ดของ React app
ส่วนไฟล์นี้เราออกแบบเองทั้งหมด เพราะยังไม่มี client ตัวไหนใช้ auth

## Endpoints

| Method | Path           | ต้องมี token | Body ที่รับ                    |
| ------ | -------------- | ------------ | ------------------------------ |
| POST   | /auth/signup   | ไม่           | { email, password, name }      |
| POST   | /auth/login    | ไม่           | { email, password }            |
| POST   | /auth/refresh  | ไม่           | { refreshToken }               |
| POST   | /auth/logout   | ใช่          | (ไม่มี)                         |
| GET    | /auth/me       | ใช่          | (ไม่มี)                         |
| GET    | /orders/me     | ใช่          | (ไม่มี)                         |
| GET    | /admin/orders  | ใช่ + ADMIN  | (ไม่มี)                         |

## User

ใช้เป็น response ของ POST /auth/signup (201) และ GET /auth/me (200)

interface User {
  id: number;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: string;   // ISO 8601
}

ห้ามมี password หรือ passwordHash ใน response ของ endpoint ใดทั้งสิ้น

## Tokens

ใช้เป็น response ของ POST /auth/login (200) และ POST /auth/refresh (200)

interface TokenPair {
  accessToken: string;    // JWT อายุสั้น payload = { sub, email, role }
  refreshToken: string;   // JWT อายุยาว เซ็นด้วย secret คนละตัว
}

- access token อายุ 900 วินาที (15 นาที)
- refresh token อายุ 604800 วินาที (7 วัน) และใช้ได้ครั้งเดียว
  พอ refresh สำเร็จ ใบเดิมต้องใช้ไม่ได้อีก

## กฎของรหัสผ่าน

- อย่างน้อย 8 ตัวอักษร
- เก็บแบบ hash เท่านั้น ห้ามเก็บรหัสผ่านดิบในฐานข้อมูลหรือใน log

## Errors

- ไม่มี token, token ผิด หรือ token หมดอายุ → 401
  { "message": "Unauthorized", "statusCode": 401 }
- token ถูกต้องแต่ role ไม่พอ → 403
  { "message": "Forbidden resource", "error": "Forbidden", "statusCode": 403 }
- อีเมลหรือรหัสผ่านผิดตอน login → 401 message "Invalid credentials"
  ทั้งสองกรณีต้องได้ข้อความเดียวกัน ห้ามบอกว่าอีเมลนั้นมีอยู่จริงหรือไม่
- สมัครด้วยอีเมลที่มีอยู่แล้ว → 409 message "Email already registered"
- body ผิดรูป → 400 message เป็น array ตามรูปแบบเดิมของ ValidationPipe
