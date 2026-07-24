from __future__ import annotations
import re
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, HRFlowable
)

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "INFORME_FINAL.md"
OUTPUT = ROOT / "output" / "pdf" / "Informe_Final_Happy_Donut.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

font_dir = Path("C:/Windows/Fonts")
pdfmetrics.registerFont(TTFont("HDText", str(font_dir / "arial.ttf")))
pdfmetrics.registerFont(TTFont("HDText-Bold", str(font_dir / "arialbd.ttf")))
pdfmetrics.registerFont(TTFont("HDText-Italic", str(font_dir / "ariali.ttf")))
mono = font_dir / "consola.ttf"
if not mono.exists():
    mono = font_dir / "cour.ttf"
pdfmetrics.registerFont(TTFont("HDMono", str(mono)))

ORANGE = colors.HexColor("#F47B20")
DARK = colors.HexColor("#1F2937")
MUTED = colors.HexColor("#5F6B7A")
LIGHT = colors.HexColor("#FFF4E8")
BLUE = colors.HexColor("#EAF3FF")
GREEN = colors.HexColor("#EAF8EE")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="HDTitle", fontName="HDText-Bold", fontSize=26, leading=31, textColor=DARK, alignment=TA_CENTER, spaceAfter=7*mm))
styles.add(ParagraphStyle(name="HDSubtitle", fontName="HDText", fontSize=12, leading=17, textColor=MUTED, alignment=TA_CENTER, spaceAfter=5*mm))
styles.add(ParagraphStyle(name="HDH1", fontName="HDText-Bold", fontSize=17, leading=21, textColor=DARK, spaceBefore=5*mm, spaceAfter=3*mm, keepWithNext=True))
styles.add(ParagraphStyle(name="HDH2", fontName="HDText-Bold", fontSize=13, leading=17, textColor=ORANGE, spaceBefore=4*mm, spaceAfter=2*mm, keepWithNext=True))
styles.add(ParagraphStyle(name="HDBody", fontName="HDText", fontSize=9.3, leading=13.2, textColor=DARK, alignment=TA_LEFT, spaceAfter=2.4*mm))
styles.add(ParagraphStyle(name="HDBullet", parent=styles["HDBody"], leftIndent=5*mm, firstLineIndent=-3*mm, bulletIndent=1*mm))
styles.add(ParagraphStyle(name="HDNote", parent=styles["HDBody"], backColor=BLUE, borderColor=colors.HexColor("#B8D7FF"), borderWidth=0.6, borderPadding=7, spaceBefore=2*mm, spaceAfter=3*mm))
styles.add(ParagraphStyle(name="HDMeta", fontName="HDText", fontSize=8.5, leading=12, textColor=MUTED))
styles.add(ParagraphStyle(name="HDCard", fontName="HDText-Bold", fontSize=9.2, leading=12, textColor=DARK, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="HDFooter", fontName="HDText", fontSize=7.5, textColor=MUTED, alignment=TA_CENTER))

def inline(text: str) -> str:
    value = escape(text.strip())
    value = re.sub(r"`([^`]+)`", r'<font name="HDMono" size="8">\1</font>', value)
    value = re.sub(r"\*\*([^*]+)\*\*", r'<b>\1</b>', value)
    value = re.sub(r'(?<![="])https?://[^\s<]+', lambda m: f'<link href="{m.group(0)}" color="#D95F02">{m.group(0)}</link>', value)
    return value

def footer(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(colors.HexColor("#E5E7EB"))
    canvas.line(18*mm, 14*mm, width-18*mm, 14*mm)
    canvas.setFont("HDText", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(18*mm, 9*mm, "Happy Donut Software - Expediente final")
    canvas.drawRightString(width-18*mm, 9*mm, f"Página {doc.page}")
    canvas.restoreState()

story = []
story.append(Spacer(1, 13*mm))
story.append(Paragraph("HAPPY DONUT", styles["HDTitle"]))
story.append(Paragraph("Expediente final del producto software", styles["HDSubtitle"]))
story.append(HRFlowable(width="42%", thickness=3, color=ORANGE, hAlign="CENTER", spaceAfter=8*mm))
story.append(Paragraph("Arquitectura de microservicios, DDD, calidad, GitOps, SRE y resiliencia", ParagraphStyle(name="CoverLine", parent=styles["HDBody"], alignment=TA_CENTER, fontSize=12, leading=17, textColor=DARK)))
story.append(Spacer(1, 7*mm))

cards = [
    Paragraph("5<br/><font name='HDText' size='8'>bounded contexts</font>", styles["HDCard"]),
    Paragraph("21<br/><font name='HDText' size='8'>paths OpenAPI</font>", styles["HDCard"]),
    Paragraph("7<br/><font name='HDText' size='8'>imágenes locales</font>", styles["HDCard"]),
    Paragraph("1<br/><font name='HDText' size='8'>instalador reproducible</font>", styles["HDCard"]),
]
card_table = Table([cards], colWidths=[42*mm]*4, rowHeights=[24*mm])
card_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), LIGHT),
    ("BOX", (0,0), (-1,-1), 0.5, colors.HexColor("#F6C89F")),
    ("INNERGRID", (0,0), (-1,-1), 0.5, colors.white),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("LEFTPADDING", (0,0), (-1,-1), 3*mm),
    ("RIGHTPADDING", (0,0), (-1,-1), 3*mm),
]))
story.append(card_table)
story.append(Spacer(1, 8*mm))

links = [
    ["Recurso", "Enlace"],
    ["Repositorio", '<link href="https://github.com/happy-donut-software/Happy-Donnut-Software" color="#D95F02">github.com/happy-donut-software/Happy-Donnut-Software</link>'],
    ["Aplicación local", '<link href="http://localhost:30080" color="#D95F02">http://localhost:30080</link>'],
    ["Administración", '<link href="http://localhost:30080/admin/" color="#D95F02">http://localhost:30080/admin/</link>'],
    ["Argo CD", '<link href="http://localhost:30081" color="#D95F02">http://localhost:30081</link>'],
    ["Grafana", '<link href="http://localhost:30300" color="#D95F02">http://localhost:30300</link>'],
]
link_rows = [[Paragraph(cell, styles["HDMeta"]) for cell in row] for row in links]
lt = Table(link_rows, colWidths=[42*mm, 126*mm], repeatRows=1)
lt.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), DARK),
    ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("FONTNAME", (0,0), (-1,0), "HDText-Bold"),
    ("GRID", (0,0), (-1,-1), 0.4, colors.HexColor("#D7DCE2")),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#FAFAFA")]),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING", (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
]))
story.append(lt)
story.append(Spacer(1, 7*mm))
story.append(Paragraph("<b>Entorno objetivo:</b> Docker Desktop Kubernetes local, sin servidor de pago. Las URL de paneles se habilitan al ejecutar <font name='HDMono' size='8'>scripts/instalar-local.ps1</font>.", styles["HDNote"]))
story.append(Spacer(1, 5*mm))
story.append(Paragraph("Fecha de corte: 15 de julio de 2026 · Rama de integración: develop", ParagraphStyle(name="CoverFooter", parent=styles["HDMeta"], alignment=TA_CENTER)))
story.append(PageBreak())

lines = SOURCE.read_text(encoding="utf-8").splitlines()
skip_front = True
paragraph = []

def flush_paragraph():
    if paragraph:
        story.append(Paragraph(inline(" ".join(paragraph)), styles["HDBody"]))
        paragraph.clear()

for raw in lines:
    line = raw.strip()
    if skip_front:
        if line.startswith("## 1."):
            skip_front = False
        else:
            continue
    if not line:
        flush_paragraph()
        continue
    if line.startswith("## "):
        flush_paragraph()
        title = line[3:]
        story.append(KeepTogether([Paragraph(inline(title), styles["HDH1"]), HRFlowable(width="100%", thickness=1, color=colors.HexColor("#F6C89F"), spaceAfter=2*mm)]))
    elif line.startswith("### "):
        flush_paragraph()
        story.append(Paragraph(inline(line[4:]), styles["HDH2"]))
    elif line.startswith("> "):
        flush_paragraph()
        story.append(Paragraph(inline(line[2:]), styles["HDNote"]))
    elif re.match(r"^\d+\.\s+", line):
        flush_paragraph()
        story.append(Paragraph(inline(line), styles["HDBullet"], bulletText="•"))
    elif line.startswith("- "):
        flush_paragraph()
        story.append(Paragraph(inline(line[2:]), styles["HDBullet"], bulletText="•"))
    else:
        paragraph.append(line)
flush_paragraph()

doc = SimpleDocTemplate(
    str(OUTPUT), pagesize=A4, rightMargin=18*mm, leftMargin=18*mm,
    topMargin=18*mm, bottomMargin=18*mm,
    title="Expediente final del producto software - Happy Donut",
    author="Equipo Happy Donut",
    subject="DDD, microservicios, GitOps, SRE y calidad",
)
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
