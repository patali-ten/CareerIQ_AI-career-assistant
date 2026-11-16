from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_LEFT, TA_CENTER
import io
from datetime import date


def generate_cover_letter_pdf(cover_letter_text: str, applicant_name: str) -> bytes:
    """
    Generate a styled PDF cover letter.
    Returns raw PDF bytes.
    """
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2.5 * cm,
        leftMargin=2.5 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    name_style = ParagraphStyle(
        "NameStyle",
        parent=styles["Normal"],
        fontSize=18,
        textColor=colors.HexColor("#1a1a2e"),
        fontName="Helvetica-Bold",
        alignment=TA_CENTER,
        spaceAfter=4,
    )

    date_style = ParagraphStyle(
        "DateStyle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#666666"),
        alignment=TA_CENTER,
        spaceAfter=20,
    )

    divider_style = ParagraphStyle(
        "DividerStyle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#4f8ef7"),
        alignment=TA_CENTER,
        spaceAfter=24,
    )

    body_style = ParagraphStyle(
        "BodyStyle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=colors.HexColor("#1a1a2e"),
        fontName="Helvetica",
        leading=18,
        alignment=TA_LEFT,
        spaceAfter=14,
    )

    story = []

    # Header
    story.append(Paragraph(applicant_name, name_style))
    story.append(Paragraph(date.today().strftime("%B %d, %Y"), date_style))
    story.append(Paragraph("─" * 60, divider_style))

    # Body paragraphs
    paragraphs = cover_letter_text.strip().split("\n\n")
    for para in paragraphs:
        clean = para.strip().replace("\n", " ")
        if clean:
            story.append(Paragraph(clean, body_style))
            story.append(Spacer(1, 6))

    # Signature
    story.append(Spacer(1, 20))
    story.append(Paragraph("Sincerely,", body_style))
    story.append(Spacer(1, 16))
    story.append(Paragraph(f"<b>{applicant_name}</b>", body_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()