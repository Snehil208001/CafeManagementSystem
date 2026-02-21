# Cafe Management System - API Test Script
# Backend must be running. Use PORT=3002 if 3001 is in use: $env:PORT=3002; npm run dev
$baseUrl = if ($env:API_PORT) { "http://localhost:$env:API_PORT" } else { "http://localhost:3001" }
$passed = 0
$failed = 0

function Test-Api {
    param($name, $method, $url, $body = $null)
    try {
        $params = @{ Uri = $url; Method = $method; UseBasicParsing = $true }
        if ($body) { $params.Body = ($body | ConvertTo-Json); $params.ContentType = "application/json" }
        $r = Invoke-WebRequest @params
        Write-Host "[PASS] $name - Status: $($r.StatusCode)" -ForegroundColor Green
        $script:passed++
        return $r.Content | ConvertFrom-Json
    } catch {
        Write-Host "[FAIL] $name - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
        return $null
    }
}

Write-Host "`n=== Cafe Management System API Tests ===`n" -ForegroundColor Cyan

# 1. GET /api/menu
$menu = Test-Api "GET /api/menu" GET "$baseUrl/api/menu"
if ($menu -and $menu.dishes.Count -gt 0) { Write-Host "  -> $($menu.dishes.Count) dishes found" }

# 2. GET /api/banners
Test-Api "GET /api/banners" GET "$baseUrl/api/banners" | Out-Null

# 3. POST /api/auth/login
$login = Test-Api "POST /api/auth/login" POST "$baseUrl/api/auth/login" @{ email = "manager@cafe.com"; password = "manager123" }
$token = $login.token

# 4. POST /api/orders (create order)
$dishId = $menu.dishes[0].id
$orderBody = @{ tableNumber = 1; items = @(@{ dishId = $dishId; name = "Espresso"; price = 80; quantity = 2 }) }
$order = Test-Api "POST /api/orders" POST "$baseUrl/api/orders" $orderBody

# 5. GET /api/orders/table/1
Test-Api "GET /api/orders/table/1" GET "$baseUrl/api/orders/table/1" | Out-Null

# 6. Manager: GET /api/orders/manager (requires auth)
if ($token) {
    $headers = @{ Authorization = "Bearer $token" }
    try {
        $r = Invoke-WebRequest -Uri "$baseUrl/api/orders/manager" -Headers $headers -UseBasicParsing
        Write-Host "[PASS] GET /api/orders/manager (auth) - Status: $($r.StatusCode)" -ForegroundColor Green
        $script:passed++
    } catch {
        Write-Host "[FAIL] GET /api/orders/manager - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
    }

    # 7. PATCH order status
    if ($order -and $order.id) {
        try {
            $r = Invoke-WebRequest -Uri "$baseUrl/api/orders/$($order.id)/status" -Method PATCH -Headers $headers -Body '{"status":"confirmed"}' -ContentType "application/json" -UseBasicParsing
            Write-Host "[PASS] PATCH /api/orders/:id/status - Status: $($r.StatusCode)" -ForegroundColor Green
            $script:passed++
        } catch {
            Write-Host "[FAIL] PATCH order status - $($_.Exception.Message)" -ForegroundColor Red
            $script:failed++
        }
    }

    # 8. GET /api/menu/all
    try {
        $r = Invoke-WebRequest -Uri "$baseUrl/api/menu/all" -Headers $headers -UseBasicParsing
        Write-Host "[PASS] GET /api/menu/all (auth) - Status: $($r.StatusCode)" -ForegroundColor Green
        $script:passed++
    } catch {
        Write-Host "[FAIL] GET /api/menu/all - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
    }

    # 9. POST /api/banners
    try {
        $bannerBody = @{ imageUrl = "https://via.placeholder.com/300x100"; link = "https://example.com"; position = 0 }
        $r = Invoke-WebRequest -Uri "$baseUrl/api/banners" -Method POST -Headers $headers -Body ($bannerBody | ConvertTo-Json) -ContentType "application/json" -UseBasicParsing
        Write-Host "[PASS] POST /api/banners - Status: $($r.StatusCode)" -ForegroundColor Green
        $script:passed++
    } catch {
        Write-Host "[FAIL] POST /api/banners - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
    }

    # 10. GET /api/tables
    try {
        $r = Invoke-WebRequest -Uri "$baseUrl/api/tables" -Headers $headers -UseBasicParsing
        Write-Host "[PASS] GET /api/tables - Status: $($r.StatusCode)" -ForegroundColor Green
        $script:passed++
    } catch {
        Write-Host "[FAIL] GET /api/tables - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
    }

    # 11. POST /api/offers
    try {
        $offerBody = @{ title = "20% off Coffee"; discountType = "percentage"; discountValue = 20; applicableDishIds = @() }
        $r = Invoke-WebRequest -Uri "$baseUrl/api/offers" -Method POST -Headers $headers -Body ($offerBody | ConvertTo-Json) -ContentType "application/json" -UseBasicParsing
        Write-Host "[PASS] POST /api/offers - Status: $($r.StatusCode)" -ForegroundColor Green
        $script:passed++
    } catch {
        Write-Host "[FAIL] POST /api/offers - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
    }

    # 12. POST /api/menu (add dish)
    try {
        $dishBody = @{ name = "Test Tea"; description = "Hot tea"; price = 50; category = "Beverages" }
        $r = Invoke-WebRequest -Uri "$baseUrl/api/menu" -Method POST -Headers $headers -Body ($dishBody | ConvertTo-Json) -ContentType "application/json" -UseBasicParsing
        Write-Host "[PASS] POST /api/menu (add dish) - Status: $($r.StatusCode)" -ForegroundColor Green
        $script:passed++
    } catch {
        Write-Host "[FAIL] POST /api/menu - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
    }
}

Write-Host "`n=== Results: $passed passed, $failed failed ===`n" -ForegroundColor Cyan
