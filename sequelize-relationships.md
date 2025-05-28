
# 🗂 ความสัมพันธ์ของ Models (Sequelize)

## 🧑‍🤝‍🧑 `user`
- 🔁 belongsToMany: `role` → through `user_roles`
- 🔁 hasMany: `booking` → foreignKey: `userId`
- 🔁 hasMany: `payment` → `as: payments`, foreignKey: `userId`

## 🧑‍💼 `role`
- 🔁 belongsToMany: `user` → through `user_roles`

## 🏨 `rooms`
- 🔁 belongsToMany: `facility` → through `room_facilities`, `as: facilities`, foreignKey: `roomId`
- 🔁 belongsToMany: `promotion` → through `room_promotions`, `as: promotions`, foreignKey: `roomId`
- 🔁 belongsTo: `type` → `as: type`, foreignKey: `type_id`
- 🔁 hasMany: `booking` → `as: bookings`, foreignKey: `roomId`

## 🛏 `type`
- 🔁 hasMany: `rooms` → `as: rooms`, foreignKey: `type_id`
<!-- Promotion-to-type ถูกคอมเมนต์ออกไว้แล้ว -->

## 💳 `promotion`
- 🔁 belongsToMany: `rooms` → through `room_promotions`, `as: rooms`, foreignKey: `promotionId`
<!--
- belongsToMany: `type` → through `type_promotions`, `as: types`, foreignKey: `promotionId`
-->

## 🛎 `facility`
- 🔁 belongsToMany: `rooms` → through `room_facilities`, `as: rooms`, foreignKey: `facilityId`

## 📆 `booking`
- 🔁 belongsTo: `user` → ✅ **ต้องเพิ่ม** `as: user`, foreignKey: `userId`
- 🔁 belongsTo: `rooms` → `as: room`, foreignKey: `roomId`
- 🔁 hasOne: `payment` → `as: payments`, foreignKey: `bookingId`

## 💰 `payment`
- 🔁 belongsTo: `user` → `as: user`, foreignKey: `userId`
- 🔁 belongsTo: `booking` → `as: bookings`, foreignKey: `bookingId`, **unique**

---

## 📋 หมายเหตุ (Important Notes)
- ✅ ตรวจสอบว่า `as` ที่ใช้ใน `include` ต้องตรงกับ alias ที่กำหนดไว้ใน model relationship
- ✅ ถ้าใช้ `belongsToMany` จะได้ผลลัพธ์เป็น **array** เสมอ เช่น `room.promotions`
- 🛠 ถ้าจะเข้าถึงโปรโมชันแค่รายการเดียว ให้ดึงมาแยกต่างหากหรือเลือก `[0]` จาก array
