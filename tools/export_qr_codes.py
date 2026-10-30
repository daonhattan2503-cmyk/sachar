"""Export labelled QR codes for every configured 3D lesson model."""
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont


SITE = Path(__file__).resolve().parents[1]
OUTPUT = SITE / "qr-codes"
BASE_URL = "https://daonhattan2503-cmyk.github.io/sachar/"
MODELS = [
    ("the-ran", "CẤU TRÚC THỂ RẮN", 5),
    ("the-long", "MÔ HÌNH THỂ LỎNG", 6),
    ("the-khi", "CHUYỂN ĐỘNG THỂ KHÍ", 7),
    ("nong-chay", "SỰ NÓNG CHẢY", 9),
    ("dong-dac", "SỰ ĐÔNG ĐẶC", 10),
    ("bay-hoi", "SỰ BAY HƠI", 11),
    ("suong-mu", "SỰ NGƯNG TỤ", 12),
    ("su-soi", "SỰ SÔI", 13),
    ("chu-trinh-nuoc", "CHU TRÌNH NƯỚC TRONG TỰ NHIÊN", 14),
    ("lam-muoi-tu-nuoc-bien", "LÀM MUỐI TỪ NƯỚC BIỂN", 16),
    ("lam-nen", "LÀM NẾN: NÓNG CHẢY VÀ ĐÔNG ĐẶC", 17),
]
FONT_DIR = SITE / "assets" / "fonts"
TITLE_FONT = ImageFont.truetype(FONT_DIR / "BeVietnamPro-Bold.ttf", 27)
META_FONT = ImageFont.truetype(FONT_DIR / "BeVietnamPro-Regular.ttf", 17)


def qr_image(url):
    code = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=12, border=4)
    code.add_data(url)
    code.make(fit=True)
    return code.make_image(fill_color="#0f172a", back_color="white").convert("RGB")


def text_size(draw, text, font):
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def labelled_card(index, model_id, label, page):
    url = f"{BASE_URL}viewer.html?id={model_id}"
    qr = qr_image(url)
    width = max(qr.width + 80, 760)
    height = qr.height + 185
    card = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(card)
    draw.rounded_rectangle((0, 0, width - 1, height - 1), radius=28, outline="#cbd5e1", width=3)
    heading = f"{index:02d} · {label}"
    heading_width, _ = text_size(draw, heading, TITLE_FONT)
    draw.text(((width - heading_width) / 2, 28), heading, font=TITLE_FONT, fill="#0f172a")
    meta = f"Trang sách {page} · Quét để mở mô hình 3D"
    meta_width, _ = text_size(draw, meta, META_FONT)
    draw.text(((width - meta_width) / 2, 75), meta, font=META_FONT, fill="#475569")
    card.paste(qr, ((width - qr.width) // 2, 115))
    return card, url


def main():
    OUTPUT.mkdir(exist_ok=True)
    cards = []
    manifest = ["# QR mô hình 3D", "", f"Địa chỉ gốc: {BASE_URL}", ""]
    for index, (model_id, label, page) in enumerate(MODELS, start=1):
        card, url = labelled_card(index, model_id, label, page)
        filename = f"{index:02d}-{model_id}.png"
        card.save(OUTPUT / filename, optimize=True)
        cards.append(card)
        manifest.append(f"- `{filename}` — trang {page}: {label}; {url}")

    margin, gap = 34, 28
    cell_width = max(card.width for card in cards)
    cell_height = max(card.height for card in cards)
    rows = (len(cards) + 1) // 2
    sheet = Image.new("RGB", (margin * 2 + cell_width * 2 + gap, margin * 2 + cell_height * rows + gap * (rows - 1)), "#f1f5f9")
    for index, card in enumerate(cards):
        row, column = divmod(index, 2)
        x = margin + column * (cell_width + gap)
        y = margin + row * (cell_height + gap)
        sheet.paste(card, (x, y))
    sheet.save(OUTPUT / "tat-ca-qr-mo-hinh-3d.png", optimize=True)
    (OUTPUT / "README.md").write_text("\n".join(manifest) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
