
serve:
    # Use Python's built-in HTTP server
    python -m http.server 8000

build:
    echo "Building the site..."
    # Example: bun run build or npm run build

clean:
    echo "Cleaning..."
    rm -rf dist build *.log

graph:
    bun run generate-graph.ts