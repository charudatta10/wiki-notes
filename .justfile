set shell := ["pwsh", "-NoLogo", "-Command"]

serve:
    python -m http.server 8000

build:
    just graph
    just search

clean:
    Write-Host "Cleaning..."
    Remove-Item -Recurse -Force dist, build, pagefind, *.log -ErrorAction SilentlyContinue

graph:
    bun run generate-graph.ts

search:
    bun build-index.mjs

push:
    #! pwsh
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $hasChanges = git status --porcelain

    if (-not $hasChanges) {
        Write-Host "No changes to commit"
        exit 0
    }

    $diffSummary = git diff --stat | Select-Object -Last 1
    $msg = "$ts - $diffSummary"

    git add .
    git commit -m "$msg"
    git push

deploy:
    just build
    just push
link:
    bun run convert-wiki-links.ts
    