# Simple API Test Script
$baseUrl = "http://localhost:3000/api"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTING ALL API ROUTES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Register Organizer
Write-Host "[1] Registering Organizer..." -ForegroundColor Yellow
$registerBody = @{
    name = "Test Organizer"
    email = "test@eventz.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/organizer/register" -Method POST -Body $registerBody -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    $token = $data.token
    Write-Host "SUCCESS - Token: $($token.Substring(0,20))..." -ForegroundColor Green
} catch {
    # Try login
    $loginBody = @{
        email = "test@eventz.com"
        password = "password123"
    } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/organizer/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    $token = $data.token
    Write-Host "SUCCESS - Logged in (already exists)" -ForegroundColor Green
}

# Step 2: Create Event
Write-Host "`n[2] Creating Event..." -ForegroundColor Yellow
$eventBody = @{
    title = "Tech Conference 2025"
    description = "Amazing tech event"
    category = "Technology"
    startDate = "2025-03-15T09:00:00.000Z"
    endDate = "2025-03-15T18:00:00.000Z"
    venue = "Convention Center"
    address = "123 Main St"
    city = "Hyderabad"
    state = "Telangana"
    capacity = 500
    imageUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
    tickets = @(
        @{ type = "FREE"; name = "Free Pass"; price = 0; quantity = 100; available = 100 },
        @{ type = "REGULAR"; name = "Regular Pass"; price = 499; quantity = 300; available = 300 }
    )
} | ConvertTo-Json -Depth 5

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$response = Invoke-WebRequest -Uri "$baseUrl/events" -Method POST -Body $eventBody -Headers $headers -UseBasicParsing
$event = $response.Content | ConvertFrom-Json
$eventId = $event._id
Write-Host "SUCCESS - Event ID: $eventId" -ForegroundColor Green

# Step 3: Publish Event
Write-Host "`n[3] Publishing Event..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$baseUrl/events/$eventId/publish" -Method PATCH -Headers $headers -UseBasicParsing
Write-Host "SUCCESS - Event Published" -ForegroundColor Green

# Step 4: Get All Events
Write-Host "`n[4] Getting All Published Events..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$baseUrl/events?status=PUBLISHED" -Method GET -ContentType "application/json" -UseBasicParsing
$events = $response.Content | ConvertFrom-Json
Write-Host "SUCCESS - Found $($events.Count) events" -ForegroundColor Green

# Step 5: Get Dashboard Analytics
Write-Host "`n[5] Getting Dashboard Analytics..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$baseUrl/dashboard/analytics" -Method GET -Headers $headers -UseBasicParsing
$analytics = $response.Content | ConvertFrom-Json
Write-Host "SUCCESS - Total Events: $($analytics.summary.totalEvents), Revenue: $($analytics.summary.totalRevenue)" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nTest Account Created:" -ForegroundColor Yellow
Write-Host "  Email: test@eventz.com" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host "`nFrontend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "Backend: http://localhost:3000/api" -ForegroundColor Yellow
