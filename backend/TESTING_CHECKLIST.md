# 🧪 Backend Testing Checklist

Use this checklist to systematically test all backend functionality.

## Prerequisites Setup
- [ ] MongoDB is installed and running (or Atlas connection configured)
- [ ] `.env` file created from `.env.example` with all required variables
- [ ] Gmail account configured with App Password for email testing
- [ ] Razorpay test account created (optional for payment testing)
- [ ] VS Code with REST Client extension installed (or Postman ready)

---

## Phase 1: Environment & Server ✅

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with:
  - [ ] MONGO_URI
  - [ ] JWT_SECRET (min 32 characters)
  - [ ] EMAIL_USER
  - [ ] EMAIL_PASS
  - [ ] RAZORPAY_KEY_ID (optional for now)
  - [ ] RAZORPAY_KEY_SECRET (optional for now)
- [ ] Server starts successfully (`npm run start:dev`)
- [ ] No compilation errors in terminal
- [ ] Server accessible at `http://localhost:3000/api`

**Expected Output:**
```
🚀 Event Organizer & Ticketing API
📡 Server running on http://localhost:3000
📚 API endpoints available at http://localhost:3000/api
🔥 Ready for testing!
```

---

## Phase 2: Organizer Authentication 🔐

### Test 2.1: Organizer Registration
- [ ] Send POST to `/api/auth/organizer/register`
- [ ] Use valid email, password, and name
- [ ] Receive 201 Created status
- [ ] Response contains organizer data (without password)
- [ ] Organizer saved in MongoDB (`db.organizers.find()`)

**✅ Success Criteria:**
- Response has `_id`, `email`, `name`, `role: "ORGANIZER"`
- Password is NOT in response
- MongoDB has new organizer document

### Test 2.2: Organizer Login
- [ ] Send POST to `/api/auth/organizer/login`
- [ ] Use registered email and password
- [ ] Receive 200 OK status
- [ ] Response contains `access_token`
- [ ] Token is a valid JWT string

**✅ Success Criteria:**
- Receives JWT token
- Token format: `eyJhbGciOiJIUzI1NiIs...`
- Can decode token (contains userId and role)

**📝 SAVE THIS TOKEN!** You'll need it for all protected routes.

### Test 2.3: Invalid Login Attempts
- [ ] Wrong password → 401 Unauthorized
- [ ] Non-existent email → 401 Unauthorized
- [ ] Missing fields → 400 Bad Request

---

## Phase 3: Event Management 🎪

### Test 3.1: Create Event (Protected)
- [ ] Send POST to `/api/events`
- [ ] Include `Authorization: Bearer <token>` header
- [ ] Send complete event data (see test-api.http)
- [ ] Include all required fields:
  - [ ] title, description
  - [ ] startDate, endDate, startTime, endTime
  - [ ] location, city, category
  - [ ] capacity, bannerUrl
  - [ ] tickets array with at least one ticket type
- [ ] Receive 201 Created status
- [ ] Event created with status "DRAFT"
- [ ] Tickets have `available` field matching `quantity`

**✅ Success Criteria:**
- Event ID returned in response
- Event saved in MongoDB
- Initial `totalRegistrations: 0` and `totalRevenue: 0`

**📝 SAVE THE EVENT ID!** Use it for subsequent tests.

### Test 3.2: Get All Events (Public)
- [ ] Send GET to `/api/events` (NO auth header)
- [ ] Receive array of events
- [ ] Only PUBLISHED events returned (if any)
- [ ] Draft events NOT visible to public

### Test 3.3: Get Single Event (Public)
- [ ] Send GET to `/api/events/:eventId`
- [ ] Receive complete event details
- [ ] Includes all fields and ticket information

### Test 3.4: Publish Event (Protected)
- [ ] Send PATCH to `/api/events/:eventId/publish`
- [ ] Include Authorization header
- [ ] Event status changes to "PUBLISHED"
- [ ] Event now visible in public GET `/api/events`

### Test 3.5: Get My Events (Protected)
- [ ] Send GET to `/api/events/organizer/me`
- [ ] Include Authorization header
- [ ] Receive only events created by logged-in organizer
- [ ] All statuses visible (DRAFT, PUBLISHED, etc.)

### Test 3.6: Update Event (Protected)
- [ ] Send PUT to `/api/events/:eventId`
- [ ] Update any field (e.g., capacity, title)
- [ ] Changes reflected in response
- [ ] Verify in MongoDB

### Test 3.7: Unpublish Event (Protected)
- [ ] Send PATCH to `/api/events/:eventId/unpublish`
- [ ] Status changes to "UNPUBLISHED"
- [ ] Event removed from public listing

### Test 3.8: Authorization Tests
- [ ] Try creating event without token → 401 Unauthorized
- [ ] Try with invalid token → 401 Unauthorized
- [ ] Try with USER role token (if implemented) → 403 Forbidden

---

## Phase 4: User Registration Flow 👤

**Prerequisites:** Have a published event from Phase 3

### Test 4.1: Initiate Registration (FREE Ticket)
- [ ] Send POST to `/api/registrations/initiate`
- [ ] Use published event ID
- [ ] Select ticket type: "FREE"
- [ ] Provide user details (name, email, phone)
- [ ] Receive `registrationId`
- [ ] Receive message: "OTP sent to your email and phone"
- [ ] **CHECK YOUR EMAIL** for OTP code
- [ ] **CHECK TERMINAL LOGS** for OTP (printed for testing)

**✅ Success Criteria:**
- Registration created with status "PENDING_OTP"
- OTP sent to email
- OTP valid for 5 minutes

**📝 SAVE THE REGISTRATION ID and OTP!**

### Test 4.2: Verify OTP (FREE Ticket)
- [ ] Send POST to `/api/registrations/verify-otp`
- [ ] Use registrationId and OTP from previous test
- [ ] Within 5 minutes of OTP generation
- [ ] Receive response with:
  - [ ] `status: "COMPLETED"`
  - [ ] `requiresPayment: false`
- [ ] **CHECK YOUR EMAIL** for ticket PDF
- [ ] MongoDB shows:
  - [ ] Registration status: "COMPLETED"
  - [ ] `otpVerified: true`
  - [ ] `registrationNumber` generated
  - [ ] `paymentStatus: "NOT_REQUIRED"`

**✅ Success Criteria:**
- Registration completed immediately (no payment needed)
- Ticket PDF received via email
- QR code included in ticket
- Unique registration number assigned

### Test 4.3: Duplicate Registration Prevention
- [ ] Try to register again with same email/phone
- [ ] For same event
- [ ] Should receive error: "Already registered for this event"
- [ ] 409 Conflict status

### Test 4.4: OTP Expiry Test
- [ ] Initiate new registration
- [ ] Wait 6 minutes (OTP expires after 5)
- [ ] Try to verify OTP
- [ ] Should receive error: "OTP expired"
- [ ] 400 Bad Request status

### Test 4.5: Resend OTP
- [ ] Use registration ID from expired OTP
- [ ] Send POST to `/api/registrations/resend-otp`
- [ ] Receive new OTP via email
- [ ] New OTP valid for 5 minutes
- [ ] Verify with new OTP successfully

### Test 4.6: Invalid OTP
- [ ] Try verifying with wrong OTP code
- [ ] Should receive error: "Invalid OTP"
- [ ] 400 Bad Request status

---

## Phase 5: Paid Ticket Flow 💳

**Prerequisites:** Event with PAID tickets (EARLY_BIRD, REGULAR, or VIP)

### Test 5.1: Initiate Registration (PAID Ticket)
- [ ] Send POST to `/api/registrations/initiate`
- [ ] Select paid ticket type (e.g., "EARLY_BIRD")
- [ ] Receive registrationId
- [ ] Check email for OTP

### Test 5.2: Verify OTP (PAID Ticket)
- [ ] Verify OTP
- [ ] Receive response with:
  - [ ] `status: "PENDING_PAYMENT"`
  - [ ] `requiresPayment: true`
  - [ ] `amount: <ticket_price>`
- [ ] Registration NOT completed yet

### Test 5.3: Create Payment Order
- [ ] Send POST to `/api/payments/registration/create-order`
- [ ] Use registrationId
- [ ] Receive Razorpay order details:
  - [ ] `razorpayOrderId`
  - [ ] `amount` (in paise)
  - [ ] `currency: "INR"`

**📝 For testing without Razorpay integration:**
You can skip to manual completion or use Razorpay test mode.

### Test 5.4: Payment Verification (Manual Test)
- [ ] Send POST to `/api/payments/registration/verify`
- [ ] Include dummy Razorpay response:
  - razorpay_order_id
  - razorpay_payment_id
  - razorpay_signature (must be valid)
- [ ] Registration completes
- [ ] Ticket sent via email
- [ ] Event stats updated (revenue, registrations)

**⚠️ Note:** Actual payment verification requires valid Razorpay credentials.

---

## Phase 6: Dashboard & Analytics 📊

**Prerequisites:** Complete several registrations (both free and paid)

### Test 6.1: Organizer Analytics Overview
- [ ] Send GET to `/api/dashboard/analytics`
- [ ] Include Authorization header
- [ ] Receive summary data:
  - [ ] totalEvents
  - [ ] totalRegistrations
  - [ ] totalRevenue
  - [ ] publishedEvents, draftEvents, completedEvents
- [ ] Verify calculations match MongoDB data

**✅ Success Criteria:**
- All counts accurate
- Revenue calculation correct
- Ticket type breakdown correct

### Test 6.2: Event-Specific Analytics
- [ ] Send GET to `/api/dashboard/events/:eventId/analytics`
- [ ] Include Authorization header
- [ ] Receive event-specific data:
  - [ ] Event details
  - [ ] Registration count
  - [ ] Revenue for this event
  - [ ] Capacity filled percentage
  - [ ] Ticket type breakdown

### Test 6.3: Registered Users List
- [ ] Send GET to `/api/dashboard/events/:eventId/users`
- [ ] Include Authorization header
- [ ] Receive array of registered users
- [ ] Each user has:
  - [ ] userName, userEmail, userPhone
  - [ ] ticketType, ticketPrice
  - [ ] paymentStatus
  - [ ] registrationNumber
  - [ ] createdAt timestamp

### Test 6.4: Filter by Ticket Type
- [ ] GET `/api/dashboard/events/:eventId/users?ticketType=EARLY_BIRD`
- [ ] Receive only users with EARLY_BIRD tickets

### Test 6.5: Filter by Payment Status
- [ ] GET `/api/dashboard/events/:eventId/users?paymentStatus=PAID`
- [ ] Receive only users who paid

### Test 6.6: Analytics Recalculation
- [ ] Complete a new registration
- [ ] Check analytics again
- [ ] Verify counts incremented
- [ ] Verify revenue updated (if paid ticket)

---

## Phase 7: Data Integrity 🔍

### Test 7.1: Event Ticket Availability
- [ ] Check event tickets `available` count
- [ ] Complete a registration
- [ ] Verify `available` decreased by 1
- [ ] Verify `totalRegistrations` increased by 1

### Test 7.2: Revenue Tracking
- [ ] Note initial event `totalRevenue`
- [ ] Complete paid registration (e.g., ₹499)
- [ ] Verify `totalRevenue` increased by ticket price

### Test 7.3: MongoDB Consistency
```bash
mongosh
use eventz

# Check event stats
db.events.findOne({_id: ObjectId("...")})

# Count registrations
db.registrations.countDocuments({eventId: ObjectId("..."), status: "COMPLETED"})

# Sum revenue
db.registrations.aggregate([
  {$match: {eventId: ObjectId("..."), status: "COMPLETED"}},
  {$group: {_id: null, total: {$sum: "$ticketPrice"}}}
])
```

- [ ] Manual counts match event stats
- [ ] Revenue calculation matches

---

## Phase 8: Error Handling 🐛

### Test 8.1: Invalid Event ID
- [ ] Try registering for non-existent event
- [ ] Should receive 404 Not Found

### Test 8.2: Sold Out Tickets
- [ ] Create event with 1 ticket
- [ ] Complete 1 registration
- [ ] Try to register again
- [ ] Should receive "Tickets sold out" error

### Test 8.3: Unpublished Event Registration
- [ ] Create event but don't publish
- [ ] Try to register
- [ ] Should receive "Event not available" error

### Test 8.4: Missing Required Fields
- [ ] Try creating event without title
- [ ] Try registering without email
- [ ] Should receive 400 Bad Request with validation errors

### Test 8.5: Invalid Ticket Type
- [ ] Try registering with ticket type that doesn't exist
- [ ] Should receive 400 Bad Request

---

## Phase 9: Email Delivery 📧

- [ ] OTP emails received within 30 seconds
- [ ] OTP clearly visible in email
- [ ] Email subject is clear
- [ ] Ticket PDF emails received after registration
- [ ] PDF attachment opens correctly
- [ ] QR code visible in PDF
- [ ] All user and event details correct in ticket

**Check Spam Folder if not received!**

---

## Phase 10: Advanced Scenarios 🚀

### Scenario A: Multiple Events
- [ ] Create 3 different events
- [ ] Publish all
- [ ] Register for each
- [ ] Dashboard shows all 3 events
- [ ] Analytics aggregate correctly

### Scenario B: Multiple Users per Event
- [ ] Register 5 different users for same event
- [ ] All receive unique registration numbers
- [ ] All receive tickets
- [ ] User list shows all 5

### Scenario C: Mixed Ticket Types
- [ ] Register users with different ticket types
- [ ] Analytics show correct breakdown
- [ ] Revenue calculation includes only paid tickets

### Scenario D: Event Lifecycle
- [ ] Create event (DRAFT)
- [ ] Publish (PUBLISHED)
- [ ] Accept registrations
- [ ] Unpublish (UNPUBLISHED)
- [ ] Mark complete (COMPLETED)
- [ ] Verify status changes don't break existing registrations

---

## ✅ Final Verification

### Database Verification
```bash
mongosh
use eventz

# Count documents
db.organizers.countDocuments()  # Should have your test organizer
db.events.countDocuments()      # Should have test events
db.registrations.countDocuments({status: "COMPLETED"})  # Completed registrations

# Verify indexes
db.registrations.getIndexes()   # Should have indexes on eventId, userPhone, etc.
```

### API Coverage
- [ ] All authentication endpoints tested
- [ ] All event CRUD endpoints tested
- [ ] All registration flow endpoints tested
- [ ] All payment endpoints tested (or documented as requiring Razorpay)
- [ ] All dashboard endpoints tested

### Business Logic
- [ ] OTP expiry works (5 minutes)
- [ ] Duplicate prevention works
- [ ] Ticket availability decrements correctly
- [ ] Revenue tracking accurate
- [ ] Free tickets complete immediately
- [ ] Paid tickets require payment
- [ ] JWT authentication protects organizer routes
- [ ] Public routes accessible without auth

---

## 🎉 Testing Complete!

If all checkboxes are marked:
- ✅ Backend is production-ready
- ✅ All business logic verified
- ✅ Error handling in place
- ✅ Security working correctly
- ✅ Ready for frontend integration!

---

## 📝 Test Results Log

**Date:** ___________
**Tester:** ___________

**Summary:**
- Total Tests: ___________
- Passed: ___________
- Failed: ___________
- Blocked: ___________

**Issues Found:**
1. ___________
2. ___________
3. ___________

**Notes:**
___________________________________________
___________________________________________
___________________________________________
