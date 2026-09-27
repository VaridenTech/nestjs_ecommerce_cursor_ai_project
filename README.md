# ecommerce-api — โค้ดประกอบคอร์ส "สร้าง E-commerce API ด้วย NestJS + Cursor AI"

Repo นี้เก็บโค้ดของโปรเจกต์ `ecommerce-api` ตามคอร์สในคู่มือ (handbook) ทีละบทเรียน
แต่ละ branch คือสภาพของโปรเจกต์ **ตอนจบบทนั้น** — ใช้เทียบกับงานของตัวเอง
หรือ checkout ไปเริ่มบทถัดไปเมื่อโค้ดของเราพังจนไปต่อไม่ได้

Stack: NestJS 12 (ESM) · Prisma 7 + PostgreSQL 17 · class-validator · Swagger · JWT · Vitest

## เริ่มจาก branch ไหนก็ได้

```sh
git clone https://github.com/VaridenTech/nestjs_ecommerce_cursor_ai_project.git
cd nestjs_ecommerce_cursor_ai_project
git checkout 16_post_carts_add        # branch ของบทที่ต้องการ (ดูตารางด้านล่าง)

npm install
cp .env.example .env                  # ตั้งแต่บทที่ 05
docker compose up -d                  # ตั้งแต่บทที่ 05
npx prisma migrate dev                # ตั้งแต่บทที่ 08 (สร้างตารางตาม migration ของ branch นั้น)
npx prisma generate                   # ตั้งแต่บทที่ 06 (src/generated/prisma ไม่ได้อยู่ใน git)
npm run db:seed                       # ตั้งแต่บทที่ 09

npm run start:dev                     # http://localhost:3000  (Swagger ที่ /api ตั้งแต่บทที่ 18)
npm run test:e2e                      # ต้องเปิดฐานข้อมูลไว้
```

**สลับ branch ย้อนหลัง:** ถ้าฐานข้อมูลมี migration ของบทที่ใหม่กว่า branch ที่ checkout
ให้ล้างแล้วสร้างใหม่ด้วย `npx prisma migrate reset` (ข้อมูลในเครื่องจะหายทั้งหมด) แล้วรัน `npm run db:seed` อีกรอบ

## Branch ของแต่ละบท

| บท | Branch | สิ่งที่เพิ่มในบทนี้ | e2e |
| -- | ------ | ------------------- | --- |
| 01 | — | ภาพรวมคอร์ส (ไม่มีโค้ด) | |
| 02 | `02_scaffolding_the_project` | `nest new ecommerce-api` | 1 |
| 03 | `03_capturing_the_dummyjson_contract` | `docs/api-spec.md` | 1 |
| 04 | `04_cursor_rules_and_the_prompt_template` | `.cursor/rules/project.mdc` | 1 |
| 05 | `05_running_postgresql` | `docker-compose.yml`, `.env.example` | 1 |
| 06 | `06_setting_up_prisma` | Prisma 7, `PrismaService`, `ConfigModule` | 1 |
| 07 | `07_modeling_products_in_prisma` | model `Category`, `Product`, `Review` | 1 |
| 08 | `08_running_the_first_migration` | migration `init` | 1 |
| 09 | `09_seeding_real_products` | `prisma/seed.ts` (faker, 208 สินค้า) | 1 |
| 10 | `10_get_products_categories` | `GET /products/categories` | 1 |
| 11 | `11_mapping_rows_to_the_contract` | `ProductResponseDto` + `product.mapper.ts` | 1 |
| 12 | `12_get_product_by_id` | `GET /products/:id` + `test/products.e2e-spec.ts` | 5 |
| 13 | `13_get_products_with_pagination` | `GET /products?skip&limit` + `ValidationPipe` | 8 |
| 14 | `14_get_products_by_category` | `GET /products/category/:slug` | 10 |
| 15 | `15_modeling_orders` | model `Order`, `OrderItem` + `AddCartDto` | 10 |
| 16 | `16_post_carts_add` | `POST /carts/add` + `test/orders.e2e-spec.ts` | 11 |
| 17 | `17_enabling_cors_and_port_config` | CORS | 11 |
| 18 | `18_adding_swagger` | Swagger ที่ `/api` | 11 |
| 19 | `19_documenting_dtos_and_responses` | decorator ของ Swagger | 11 |
| 20 | `20_switching_the_react_app` | (แก้ฝั่ง React app เท่านั้น — โค้ดเท่ากับบทที่ 19) | 11 |
| 21 | `21_adding_the_user_model` | `docs/auth-spec.md`, model `User` + enum `Role` | 11 |
| 22 | `22_signup_endpoint` | `POST /auth/signup` (bcrypt) | 11 |
| 23 | `23_login_and_access_token` | `POST /auth/login` (JWT) | 11 |
| 24 | `24_the_jwt_auth_guard` | global `JwtAuthGuard`, `@Public()`, `GET /auth/me` | 11 |
| 25 | `25_current_user_and_private_orders` | `@CurrentUser()`, `GET /orders/me`, Bearer ใน Swagger | 11 |
| 26 | `26_refresh_token_rotation` | `POST /auth/refresh`, `POST /auth/logout` | 11 |
| 27 | `27_roles_and_admin_endpoints` | `RolesGuard`, `GET /admin/orders` + `test/auth.e2e-spec.ts` | 19 |
| 28 | `28_wrap_up` / `main` | โค้ดสุดท้าย + README นี้ | 19 |

คอลัมน์ e2e คือจำนวน test ที่ `npm run test:e2e` ต้องผ่านบน branch นั้น (หลัง seed แล้ว)

## หมายเหตุ

- โค้ดใน `src/` สร้างจาก prompt ของ Cursor ในแต่ละบท — โค้ดที่ Cursor ให้คุณอาจหน้าตาต่างออกไปได้
  สิ่งที่ต้องตรงกันคือ "ผลลัพธ์ที่ต้องได้" ของ prompt ไม่ใช่ตัวอักษรทุกตัว
- `.env.example` ใช้ค่าสำหรับเครื่อง dev เท่านั้น ห้ามใช้ secret พวกนี้กับระบบจริง
- `npm` รุ่นใหม่กั้น install script ไว้ บล็อก `allowScripts` ใน `package.json` จึงอนุมัติไว้เฉพาะแพ็กเกจที่คอร์สต้องใช้
