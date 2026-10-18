# Katiwatch SEO Verification Script
Write-Host "======================================"
Write-Host "  Katiwatch SEO Verification Check"
Write-Host "======================================"
Write-Host ""

$checks = 0
$total = 0

# Check robots.txt
Write-Host "Checking robots.txt..."
$total++
if (Test-Path ".\public\robots.txt") {
    Write-Host "OK: robots.txt exists"
    $checks++
} else {
    Write-Host "ERROR: robots.txt missing"
}

# Check sitemaps
Write-Host "Checking sitemap files..."
$total++
if (Test-Path ".\app\sitemap.ts") {
    Write-Host "OK: Main sitemap exists"
    $checks++
} else {
    Write-Host "ERROR: Main sitemap missing"
}

$total++
if (Test-Path ".\app\sitemap-movies.xml\route.ts") {
    Write-Host "OK: Movies sitemap exists"
    $checks++
} else {
    Write-Host "ERROR: Movies sitemap missing"
}

$total++
if (Test-Path ".\app\sitemap-series.xml\route.ts") {
    Write-Host "OK: Series sitemap exists"
    $checks++
} else {
    Write-Host "ERROR: Series sitemap missing"
}

# Check new pages
Write-Host "Checking new SEO pages..."
$seoPages = @(
    ".\app\vj-movies\page.tsx",
    ".\app\about\page.tsx",
    ".\app\faq\page.tsx",
    ".\app\blog\page.tsx",
    ".\app\contact\page.tsx"
)

foreach ($page in $seoPages) {
    $total++
    $name = Split-Path $page -Leaf
    if (Test-Path $page) {
        Write-Host "OK: $name exists"
        $checks++
    } else {
        Write-Host "ERROR: $name missing"
    }
}

# Check modified files
Write-Host "Checking modified core files..."
$coreFiles = @(
    ".\app\layout.tsx",
    ".\app\page.tsx",
    ".\next.config.ts"
)

foreach ($file in $coreFiles) {
    $total++
    $name = Split-Path $file -Leaf
    if (Test-Path $file) {
        Write-Host "OK: $name exists"
        $checks++
    } else {
        Write-Host "ERROR: $name missing"
    }
}

# Check docs
Write-Host "Checking documentation..."
$total++
if (Test-Path ".\SEO_IMPLEMENTATION_GUIDE.md") {
    Write-Host "OK: Implementation guide exists"
    $checks++
} else {
    Write-Host "ERROR: Implementation guide missing"
}

$total++
if (Test-Path ".\SEO_CHANGES_SUMMARY.md") {
    Write-Host "OK: Changes summary exists"
    $checks++
} else {
    Write-Host "ERROR: Changes summary missing"
}

# Summary
Write-Host ""
Write-Host "======================================"
$percentage = [math]::Round(($checks / $total) * 100, 0)
Write-Host "Results: $checks/$total checks passed ($percentage%)"
Write-Host "======================================"
Write-Host ""

if ($percentage -eq 100) {
    Write-Host "SUCCESS: All SEO files are in place!"
    Write-Host ""
    Write-Host "Next Steps:"
    Write-Host "1. Build and test: npm run build"
    Write-Host "2. Submit to Google Search Console"
    Write-Host "3. Create Google Business Profile"
    Write-Host "4. Set up social media profiles"
    Write-Host ""
    Write-Host "Read SEO_IMPLEMENTATION_GUIDE.md for details"
} else {
    Write-Host "ATTENTION: Some files are missing"
    Write-Host "Check the errors above"
}

Write-Host ""
