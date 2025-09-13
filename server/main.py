import os
from fastapi import FastAPI
from fastapi.responses import FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles


def _get_build_dir() -> str:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "build")


BUILD_DIR = _get_build_dir()
INDEX_HTML_PATH = os.path.join(BUILD_DIR, "index.html")
CONFIG_JSON_PATH = os.path.join(BUILD_DIR, "config.json")

app = FastAPI()

# Serve compiled assets (JS/CSS) under /static
static_dir = os.path.join(BUILD_DIR, "static")
if os.path.isdir(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/", response_model=None)
def root():
    if os.path.isfile(INDEX_HTML_PATH):
        return FileResponse(INDEX_HTML_PATH)
    return PlainTextResponse("build/index.html not found. Run npm run build:webpack first.", status_code=404)


# Catch-all to support SPA client-side routing
@app.get("/{full_path:path}", response_model=None)
def spa(full_path: str):
    if os.path.isfile(INDEX_HTML_PATH):
        return FileResponse(INDEX_HTML_PATH)
    return PlainTextResponse("build/index.html not found. Run npm run build:webpack first.", status_code=404)


@app.get("/config.json")
def get_runtime_config():
    if os.path.isfile(CONFIG_JSON_PATH):
        return FileResponse(CONFIG_JSON_PATH, media_type="application/json")
    return PlainTextResponse("config.json not found in build.", status_code=404)


