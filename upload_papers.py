"""
PhD Thesis KB — 自動下載論文 PDF 並上傳至 Supabase Storage
在自己電腦上跑：pip install supabase httpx --break-system-packages && python upload_papers.py
"""

import httpx
import os
import time
from supabase import create_client

SB_URL = "https://krjttzmilwkhqueravlx.supabase.co"
SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyanR0em1pbHdraHF1ZXJhdmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTg3OTIsImV4cCI6MjA5MTIzNDc5Mn0.shVBF7sZaLTDHXumKT3xUTPbuYOErBCRbIXrNUt_ko8"
BUCKET = "phd-papers"

# Paper ID → PDF download URL
# arXiv papers have direct PDF links; others need manual download
PAPERS = {
    # Spatial backbones
    "surgenetxl":  "https://arxiv.org/pdf/2501.09436.pdf",
    "surgvista":   "https://arxiv.org/pdf/2506.02692.pdf",
    "surgmotion":  "https://arxiv.org/pdf/2602.05638.pdf",
    "surgrec":     "https://arxiv.org/pdf/2603.29966.pdf",
    # Temporal heads
    "mstcn":       "https://arxiv.org/pdf/1903.01945.pdf",
    "tecno":       "https://arxiv.org/pdf/2003.10751.pdf",
    "transsvnet":  "https://arxiv.org/pdf/2103.09712.pdf",
    "dacat":       "https://arxiv.org/pdf/2409.06217.pdf",
    "lovit":       "https://arxiv.org/pdf/2305.08989.pdf",
    "must":        "https://arxiv.org/pdf/2407.17361.pdf",
    "surgformer":  "https://arxiv.org/pdf/2408.03867.pdf",
    # VLM
    "hecvl":       "https://arxiv.org/pdf/2405.10075.pdf",
    "peskavlp":    "https://arxiv.org/pdf/2410.00263.pdf",
    # Benchmark
    "surgbench":   "https://arxiv.org/pdf/2506.07603.pdf",
    "phakir":      "https://arxiv.org/pdf/2507.16559.pdf",
    # Plane recognition (no arXiv — need manual download from publisher)
    # "igaki2022": download from DCR manually
    # "kolbinger": download from EJSO manually (open access)
    # "igaki2025": download from PMC manually
    # "kumazu":    download from Nature Sci Reports (open access)
    # "phakir":    download from MedIA manually
}

# Open access papers that can be fetched from publisher
OPEN_ACCESS = {
    "kumazu": "https://www.nature.com/articles/s41598-021-00557-3.pdf",
}

PAPERS.update(OPEN_ACCESS)


def main():
    sb = create_client(SB_URL, SB_KEY)
    os.makedirs("pdfs", exist_ok=True)

    success = []
    failed = []
    skipped = []

    for paper_id, url in PAPERS.items():
        local_path = f"pdfs/{paper_id}.pdf"
        remote_path = f"{paper_id}.pdf"

        # Check if already uploaded
        try:
            existing = sb.storage.from_(BUCKET).list()
            if any(f["name"] == f"{paper_id}.pdf" for f in existing):
                print(f"  ⏭️  {paper_id} — 已存在，跳過")
                skipped.append(paper_id)
                continue
        except Exception:
            pass

        # Download
        print(f"  ⬇️  下載 {paper_id} ...")
        try:
            with httpx.Client(follow_redirects=True, timeout=60) as client:
                r = client.get(url, headers={"User-Agent": "Mozilla/5.0"})
                if r.status_code == 200 and len(r.content) > 10000:
                    with open(local_path, "wb") as f:
                        f.write(r.content)
                    print(f"      ✅ {len(r.content) / 1024:.0f} KB")
                else:
                    print(f"      ❌ HTTP {r.status_code} or too small ({len(r.content)} bytes)")
                    failed.append(paper_id)
                    continue
        except Exception as e:
            print(f"      ❌ 下載失敗: {e}")
            failed.append(paper_id)
            continue

        # Upload to Supabase
        print(f"  ⬆️  上傳 {paper_id} 至 Supabase ...")
        try:
            with open(local_path, "rb") as f:
                sb.storage.from_(BUCKET).upload(
                    remote_path,
                    f.read(),
                    file_options={"content-type": "application/pdf", "upsert": "true"},
                )
            print(f"      ✅ 上傳成功")
            success.append(paper_id)
        except Exception as e:
            print(f"      ❌ 上傳失敗: {e}")
            failed.append(paper_id)

        time.sleep(1)  # Rate limit courtesy

    print("\n" + "=" * 50)
    print(f"✅ 成功: {len(success)} — {', '.join(success)}")
    print(f"⏭️  跳過: {len(skipped)} — {', '.join(skipped)}")
    print(f"❌ 失敗: {len(failed)} — {', '.join(failed)}")
    print("\n需手動下載的論文（非 arXiv / 需出版社帳號）：")
    manual = ["igaki2022 (DCR)", "kolbinger (EJSO)", "igaki2025 (PMC)", "mosformer", "lemon (CVPR)"]
    for m in manual:
        print(f"  📥 {m}")
    print(f"\n下載後放到 pdfs/ 資料夾，命名為 {{paper_id}}.pdf，再重跑此腳本即可自動上傳。")


if __name__ == "__main__":
    print("📚 PhD Thesis KB — 論文 PDF 批次下載 & 上傳")
    print("=" * 50)
    print(f"目標 Supabase bucket: {BUCKET}")
    print(f"論文數量: {len(PAPERS)}\n")
    main()

    # 掃描 pdfs/ 資料夾，上傳所有尚未處理的 PDF
    print("\n" + "=" * 50)
    print("📂 掃描 pdfs/ 資料夾尋找手動下載的 PDF...\n")
    if os.path.isdir("pdfs"):
        sb2 = create_client(SB_URL, SB_KEY)
        for f in sorted(os.listdir("pdfs")):
            if not f.endswith(".pdf"):
                continue
            paper_id = f.replace(".pdf", "")
            remote_path = f"{paper_id}.pdf"
            local_path = f"pdfs/{f}"
            print(f"  ⬆️  上傳 {paper_id} ({os.path.getsize(local_path) / 1024:.0f} KB) ...")
            try:
                with open(local_path, "rb") as fh:
                    sb2.storage.from_(BUCKET).upload(
                        remote_path,
                        fh.read(),
                        file_options={"content-type": "application/pdf", "upsert": "true"},
                    )
                print(f"      ✅ 上傳成功")
            except Exception as e:
                print(f"      ❌ {e}")
    else:
        print("  pdfs/ 資料夾不存在")
