# Image Resizer Script
Add-Type -AssemblyName System.Drawing

$imagesPath = ".\public\images"

function Resize-Image {
    param(
        [string]$inputPath,
        [string]$outputPath,
        [int]$width,
        [int]$height
    )
    
    try {
        Write-Host "Resizing: $inputPath to ${width}x${height}..." -ForegroundColor Cyan
        
        $tempPath = $outputPath + ".tmp"
        
        $image = [System.Drawing.Image]::FromFile($inputPath)
        $newImage = New-Object System.Drawing.Bitmap($width, $height)
        $graphics = [System.Drawing.Graphics]::FromImage($newImage)
        
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        $graphics.DrawImage($image, 0, 0, $width, $height)
        $newImage.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
        
        $graphics.Dispose()
        $newImage.Dispose()
        $image.Dispose()
        
        # Replace original with resized
        Remove-Item $outputPath -Force
        Move-Item $tempPath $outputPath -Force
        
        Write-Host "Success: $outputPath" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
        return $false
    }
}

Write-Host "`nImage Resizer Starting...`n" -ForegroundColor Yellow

# Resize Hero Images
Write-Host "Resizing Hero Images to 1920x700..." -ForegroundColor Magenta
$heroCount = 0
for ($i = 1; $i -le 7; $i++) {
    $heroFile = Join-Path $imagesPath "hero-$i.jpg"
    if (Test-Path $heroFile) {
        if (Resize-Image -inputPath $heroFile -outputPath $heroFile -width 1920 -height 700) {
            $heroCount++
        }
    }
}
Write-Host "Resized $heroCount hero images`n" -ForegroundColor Green

# Resize Course Image
Write-Host "Resizing Course Image to 800x450..." -ForegroundColor Magenta
$courseFile = Join-Path $imagesPath "tarbiyat-course.jpg"
if (Test-Path $courseFile) {
    Resize-Image -inputPath $courseFile -outputPath $courseFile -width 800 -height 450
}

Write-Host "`nResize Complete!" -ForegroundColor Yellow
