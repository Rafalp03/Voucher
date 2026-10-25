from fastapi import FastAPI

app = FastAPI(title="Voucher API")

@app.get("/health")
def health():
    return {"status": "ok"}
