"""Generate original, brand-neutral Chrome Web Store artwork with Pillow."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ICONS = ROOT / "icons"
STORE = ROOT / "store"
ORANGE = (194, 65, 12)
DARK = (101, 36, 9)


def font(size, bold=False):
    families = (
        ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"]
        if bold else ["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf"]
    )
    families += ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
                 else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    for family in families:
        if Path(family).exists():
            return ImageFont.truetype(family, size)
    return ImageFont.load_default()


def icon(size):
    scale = 4
    s = size * scale
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    pad = round(s * .125)
    d.rounded_rectangle((pad, pad, s - pad, s - pad), radius=round(s * .22), fill=ORANGE)
    d.rounded_rectangle((round(s*.29), round(s*.2), round(s*.73), round(s*.8)),
                        radius=round(s*.045), fill="white")
    d.polygon([(round(s*.61), round(s*.2)), (round(s*.73), round(s*.32)),
               (round(s*.61), round(s*.32))], fill=(255, 213, 187))
    d.line((round(s*.5), round(s*.27), round(s*.5), round(s*.58)),
           fill=DARK, width=max(2, round(s*.065)))
    for y in (.32, .41, .5):
        d.rounded_rectangle((round(s*.455), round(s*y), round(s*.545), round(s*(y+.047))),
                            radius=round(s*.012), fill=(255, 197, 148))
    d.rounded_rectangle((round(s*.435), round(s*.57), round(s*.565), round(s*.69)),
                        radius=round(s*.018), fill=DARK)
    return im.resize((size, size), Image.Resampling.LANCZOS)


def promo():
    im = Image.new("RGB", (440, 280), (255, 247, 241))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, 440, 280), radius=16, fill=(255, 247, 241))
    d.ellipse((300, -105, 555, 150), fill=(255, 226, 207))
    d.ellipse((364, 168, 520, 324), fill=(255, 231, 215))
    im.paste(icon(78), (29, 28), icon(78))
    d.text((30, 121), "ZIP submissions", font=font(28, True), fill=(54, 30, 22))
    d.text((30, 155), "inside SpeedGrader", font=font(25, True), fill=(54, 30, 22))
    d.rounded_rectangle((29, 213, 304, 250), radius=10, fill=ORANGE)
    d.text((45, 223), "Preview files in place", font=font(15, True), fill="white")
    return im


def main():
    ICONS.mkdir(exist_ok=True)
    STORE.mkdir(exist_ok=True)
    for size in (16, 32, 48, 128):
        icon(size).save(ICONS / f"icon-{size}.png")
    promo().save(STORE / "promo-440x280.png")
    print("Generated extension icons and store promo tile")


if __name__ == "__main__":
    main()
