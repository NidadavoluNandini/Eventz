# API TESTING GUIDE - Event Organizer & Ticketing System

## 📋 **Table of Contents**
1. [Setup Instructions](#setup-instructions)
2. [Authentication Flow](#authentication-flow)
3. [Event Management](#event-management)
4. [User Registration Flow](#user-registration-flow)
5. [Payment Integration](#payment-integration)
6. [Dashboard & Analytics](#dashboard--analytics)
7. [Complete Test Scenarios](#complete-test-scenarios)

---

## 🚀 **Setup Instructions**

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update with your credentials:
```bash
cp .env.example .env
```

**Required for testing:**
- `MONGO_URI` - MongoDB connection (local or Atlas)
- `JWT_SECRET` - Any random string (32+ chars)
- `EMAIL_USER` & `EMAIL_PASS` - Gmail for OTP emails
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` - For payment testing

### 3. Start MongoDB
```bash
# If using local MongoDB:
mongod

# Or use MongoDB Atlas (cloud)
```

### 4. Start Backend Server
```bash
npm run start:dev
# Server runs on http://localhost:3000
```

---

## 🔐 **Authentication Flow**

### **1. Organizer Registration**
Creates a new organizer account.

**Endpoint:** `POST /api/auth/organizer/register`

**Request:**
```json
{
  "name": "John's Events",
  "email": "john@eventsorganizer.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "_id": "64abc123...",
  "name": "John's Events",
  "email": "john@eventsorganizer.com",
  "role": "ORGANIZER",
  "createdAt": "2025-12-26T10:30:00.000Z"
}
```

---

### **2. Organizer Login**
Authenticates and returns JWT token.

**Endpoint:** `POST /api/auth/organizer/login`

**Request:**
```json
{
  "email": "john@eventsorganizer.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**💡 Save this token!** Use it in Authorization header for all protected endpoints:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎪 **Event Management**

### **3. Create Event (Protected - Organizer Only)**

**Endpoint:** `POST /api/events`

**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Tech Conference 2025",
  "description": "Join us for the biggest tech conference of the year featuring industry leaders, hands-on workshops, and networking opportunities.",
  "startDate": "2025-08-25",
  "endDate": "2025-08-25",
  "startTime": "10:00",
  "endTime": "18:00",
  "location": "Hyderabad Convention Center",
  "city": "Hyderabad",
  "category": "Technology",
  "capacity": 500,
  "bannerUrl": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
  "tickets": [
    {
      "type": "FREE",
      "name": "Free Pass",
      "price": 0,
      "quantity": 200,
      "description": "Access to main sessions"
    },
    {
      "type": "EARLY_BIRD",
      "name": "Early Bird",
      "price": 499,
      "quantity": 150,
      "description": "Includes lunch and workshops"
    },
    {
      "type": "VIP",
      "name": "VIP Pass",
      "price": 1999,
      "quantity": 50,
      "description": "All access + exclusive dinner"
    }
  ]
}
```

**Response:**
```json
{
  "_id": "64xyz789...",
  "title": "Tech Conference 2025",
  "status": "DRAFT",
  "tickets": [
    {
      "type": "FREE",
      "name": "Free Pass",
      "price": 0,
      "quantity": 200,
      "available": 200
    }
  ],
  "totalRegistrations": 0,
  "totalRevenue": 0,
  "createdAt": "2025-12-26T11:00:00.000Z"
}
```

---

### **4. Publish Event**

**Endpoint:** `PATCH /api/events/:eventId/publish`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "message": "Event published successfully",
  "event": {
    "_id": "64xyz789...",
    "title": "Tech Conference 2025",
    "status": "PUBLISHED"
  }
}
```

---

### **5. Get All Published Events (Public)**

**Endpoint:** `GET /api/events`

**Query Parameters (optional):**
- `?status=PUBLISHED` - Filter by status
- `?category=Technology` - Filter by category
- `?city=Hyderabad` - Filter by city

**Response:**
```json
[
  {
    "_id": "64xyz789...",
    "title": "Tech Conference 2025",
    "startDate": "2025-08-25",
    "city": "Hyderabad",
    "category": "Technology",
    "tickets": [...],
    "totalRegistrations": 0,
    "status": "PUBLISHED"
  }
]
```

---

### **6. Get Single Event Details (Public)**

**Endpoint:** `GET /api/events/:eventId`

**Response:**
```json
{
  "_id": "64xyz789...",
  "title": "Tech Conference 2025",
  "description": "Full event details...",
  "startDate": "2025-08-25",
  "endDate": "2025-08-25",
  "startTime": "10:00",
  "endTime": "18:00",
  "location": "Hyderabad Convention Center",
  "city": "Hyderabad",
  "category": "Technology",
  "capacity": 500,
  "tickets": [
    {
      "type": "FREE",
      "name": "Free Pass",
      "price": 0,
      "quantity": 200,
      "available": 200
    }
  ],
  "status": "PUBLISHED"
}
```

---

## 👤 **User Registration Flow**

### **7. Initiate Registration (Send OTP)**

**Endpoint:** `POST /api/registrations/initiate`

**Request:**
```json
{
  "eventId": "64xyz789...",
  "userName": "Alice Johnson",
  "userEmail": "alice@example.com",
  "userPhone": "+919876543210",
  "ticketType": "EARLY_BIRD"
}
```

**Response:**
```json
{
  "registrationId": "64reg456...",
  "message": "OTP sent to your email and phone",
  "expiresIn": "5 minutes"
}
```

**✅ System Actions:**
- Validates event exists and is published
- Checks for duplicate registrations
- Generates 6-digit OTP (valid for 5 minutes)
- Sends OTP via email and SMS
- Creates pending registration record

**📧 Check your email for OTP!**

---

### **8. Verify OTP**

**Endpoint:** `POST /api/registrations/verify-otp`

**Request:**
```json
{
  "registrationId": "64reg456...",
  "otp": 123456
}
```

**Response (for FREE tickets):**
```json
{
  "registrationId": "64reg456...",
  "status": "COMPLETED",
  "requiresPayment": false,
  "amount": 0
}
```

**Response (for PAID tickets):**
```json
{
  "registrationId": "64reg456...",
  "status": "PENDING_PAYMENT",
  "requiresPayment": true,
  "amount": 499
}
```

**✅ For free tickets:** Registration is complete! Ticket will be generated and sent.

**💳 For paid tickets:** Proceed to payment step below.

---

### **9. Resend OTP (if expired)**

**Endpoint:** `POST /api/registrations/resend-otp`

**Request:**
```json
{
  "registrationId": "64reg456..."
}
```

**Response:**
```json
{
  "message": "OTP resent successfully",
  "expiresIn": "5 minutes"
}
```

---

## 💳 **Payment Integration**

### **10. Create Payment Order**

**Endpoint:** `POST /api/payments/registration/create-order`

**Request:**
```json
{
  "registrationId": "64reg456..."
}
```

**Response:**
```json
{
  "razorpayOrderId": "order_ABC123xyz",
  "amount": 49900,
  "currency": "INR",
  "registrationId": "64reg456..."
}
```

**Frontend Integration:**
Use this data to initialize Razorpay checkout:
```javascript
const options = {
  key: "rzp_test_...", // Your Razorpay key
  amount: response.amount,
  currency: response.currency,
  order_id: response.razorpayOrderId,
  handler: function(response) {
    // Payment successful - verify it
    verifyPayment({
      registrationId: registrationId,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    });
  }
};
```

---

### **11. Verify Payment**

**Endpoint:** `POST /api/payments/registration/verify`

**Request:**
```json
{
  "registrationId": "64reg456...",
  "razorpay_order_id": "order_ABC123xyz",
  "razorpay_payment_id": "pay_XYZ789abc",
  "razorpay_signature": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and ticket sent",
  "registration": {
    "id": "64reg456...",
    "registrationNumber": "REG-1703589600000-A1B2C3D4E",
    "status": "COMPLETED"
  }
}
```

**✅ System Actions:**
- Verifies payment signature
- Completes registration
- Generates unique registration number
- Creates QR code
- Generates PDF ticket
- Sends ticket via email
- Updates event statistics
- Decreases ticket availability

---

## 📊 **Dashboard & Analytics**

### **12. Get Organizer Analytics (Protected)**

**Endpoint:** `GET /api/dashboard/analytics`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "summary": {
    "totalEvents": 5,
    "publishedEvents": 3,
    "draftEvents": 1,
    "completedEvents": 1,
    "totalRegistrations": 248,
    "totalRevenue": 125000,
    "recentRegistrations": 45
  },
  "ticketTypeStats": [
    {
      "_id": "FREE",
      "count": 120,
      "revenue": 0
    },
    {
      "_id": "EARLY_BIRD",
      "count": 85,
      "revenue": 42415
    },
    {
      "_id": "VIP",
      "count": 43,
      "revenue": 85957
    }
  ],
  "topEvents": [
    {
      "eventTitle": "Tech Conference 2025",
      "registrations": 156,
      "revenue": 78000
    }
  ],
  "registrationsTrend": [
    {
      "_id": "2025-12-20",
      "count": 12,
      "revenue": 5988
    },
    {
      "_id": "2025-12-21",
      "count": 18,
      "revenue": 8982
    }
  ]
}
```

---

### **13. Get Event-Specific Analytics**

**Endpoint:** `GET /api/dashboard/events/:eventId/analytics`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "event": {
    "id": "64xyz789...",
    "title": "Tech Conference 2025",
    "date": "2025-08-25",
    "location": "Hyderabad Convention Center",
    "capacity": 500,
    "status": "PUBLISHED"
  },
  "analytics": {
    "totalRegistrations": 156,
    "totalRevenue": 78000,
    "availableTickets": 344,
    "capacityFilled": "31.20%"
  },
  "ticketTypeBreakdown": [
    {
      "_id": "FREE",
      "count": 85,
      "revenue": 0
    },
    {
      "_id": "EARLY_BIRD",
      "count": 52,
      "revenue": 25948
    },
    {
      "_id": "VIP",
      "count": 19,
      "revenue": 37981
    }
  ]
}
```

---

### **14. Get Registered Users for Event**

**Endpoint:** `GET /api/dashboard/events/:eventId/users`

**Query Parameters:**
- `?ticketType=EARLY_BIRD` - Filter by ticket type
- `?paymentStatus=PAID` - Filter by payment status

**Headers:**
```
Authorization: Bearer <your_token>
```

**Response:**
```json
[
  {
    "_id": "64reg456...",
    "userName": "Alice Johnson",
    "userEmail": "alice@example.com",
    "userPhone": "+919876543210",
    "ticketType": "EARLY_BIRD",
    "ticketPrice": 499,
    "paymentStatus": "PAID",
    "registrationNumber": "REG-1703589600000-A1B2C3D4E",
    "createdAt": "2025-12-26T12:30:00.000Z"
  }
]
```

---

### **15. Get Organizer's Events**

**Endpoint:** `GET /api/events/organizer/me`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Response:**
```json
[
  {
    "_id": "64xyz789...",
    "title": "Tech Conference 2025",
    "status": "PUBLISHED",
    "startDate": "2025-08-25",
    "totalRegistrations": 156,
    "totalRevenue": 78000,
    "createdAt": "2025-12-26T11:00:00.000Z"
  }
]
```

---

## ✅ **Complete Test Scenarios**

### **Scenario 1: FREE Ticket Registration**
1. Create and publish an event with FREE tickets
2. Initiate registration → Get OTP
3. Verify OTP → Registration completed
4. Check email for ticket with QR code

### **Scenario 2: PAID Ticket Registration**
1. Create and publish event with PAID tickets
2. Initiate registration → Get OTP
3. Verify OTP → Requires payment
4. Create payment order
5. Simulate Razorpay payment (use test mode)
6. Verify payment → Registration completed
7. Check email for ticket

### **Scenario 3: Duplicate Prevention**
1. Complete registration for an event
2. Try to register again with same email/phone
3. Should receive error: "Already registered"

### **Scenario 4: OTP Expiry**
1. Initiate registration
2. Wait 6 minutes
3. Try to verify OTP → Error: "OTP expired"
4. Request resend OTP
5. Verify with new OTP

### **Scenario 5: Dashboard Analytics**
1. Create multiple events
2. Complete several registrations
3. Check organizer analytics
4. Verify calculations are accurate

---

## 🧪 **Testing Tools**

### **Option 1: VS Code REST Client**
Install extension: `REST Client` by Huachao Mao

Create `test.http` file:
```http
### Organizer Registration
POST http://localhost:3000/api/auth/organizer/register
Content-Type: application/json

{
  "name": "Test Organizer",
  "email": "test@organizer.com",
  "password": "Test123!"
}

### Organizer Login
POST http://localhost:3000/api/auth/organizer/login
Content-Type: application/json

{
  "email": "test@organizer.com",
  "password": "Test123!"
}
```

### **Option 2: Postman**
1. Import collection (I can create one)
2. Set environment variables
3. Run tests sequentially

### **Option 3: cURL**
```bash
# Organizer Login
curl -X POST http://localhost:3000/api/auth/organizer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@organizer.com","password":"Test123!"}'
```

---

## 🔍 **Monitoring & Debugging**

### Check MongoDB Data:
```bash
mongosh
use eventz
db.events.find().pretty()
db.registrations.find().pretty()
db.organizers.find().pretty()
```

### Check Server Logs:
Watch console for:
- OTP codes (for testing)
- Payment signatures
- Email sending status
- Error messages

---

## 📝 **Common Issues & Solutions**

**Issue:** OTP not received
- Check EMAIL_USER and EMAIL_PASS in .env
- Ensure Gmail app password is correct
- Check spam folder

**Issue:** Payment verification fails
- Verify Razorpay keys are correct
- Check signature calculation
- Test with Razorpay test mode first

**Issue:** MongoDB connection fails
- Ensure MongoDB is running
- Check MONGO_URI format
- Verify network access (for Atlas)

**Issue:** JWT token invalid
- Token might be expired
- Re-login to get new token
- Check JWT_SECRET is set

---

## 🎉 **Next Steps**

Once backend testing is complete:
1. ✅ Confirm all endpoints work
2. ✅ Verify email/SMS delivery
3. ✅ Test payment flow thoroughly
4. ➡️ Connect frontend components
5. ➡️ Deploy to production

---

**Questions? Issues?** Check server logs or contact the development team!
