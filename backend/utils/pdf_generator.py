from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_JUSTIFY
import io
from datetime import date
import re


def _extract_contact(cv_text: str) -> dict:
    """Try to pull email, phone, LinkedIn from raw CV text."""
    contact = {"email": "", "phone": "", "linkedin": ""}

    email_match = re.search(r"[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}", cv_text or "")
    if email_match:
        contact["email"] = email_match.group(0)

    phone_match = re.search(r"(\+?\d[\d\s\-().]{7,15}\d)", cv_text or "")
    if phone_match:
        contact["phone"] = phone_match.group(0).strip()

    linkedin_match = re.search(r"linkedin\.com/in/[\w-]+", cv_text or "", re.IGNORECASE)
    if linkedin_match:
        contact["linkedin"] = linkedin_match.group(0)

    return contact


def generate_cover_letter_pdf(
    cover_letter_text: str,
    applicant_name: str,
    cv_text: str = "",
) -> bytes:
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2.2 * cm,
        leftMargin=2.2 * cm,
        topMargin=2.0 * cm,
        bottomMargin=2.0 * cm,
    )

    DARK    = colors.HexColor("#1a1a2e")
    ACCENT  = colors.HexColor("#2563EB")
    GRAY    = colors.HexColor("#6B7280")
    BLACK   = colors.HexColor("#111111")

    contact = _extract_contact(cv_text)

    # ── Styles ──────────────────────────────────────────────
    name_style = ParagraphStyle(
        "Name",
        fontSize=22,
        textColor=DARK,
        fontName="Helvetica-Bold",
        spaceAfter=0,
        leading=26,
    )

    contact_style = ParagraphStyle(
        "Contact",
        fontSize=9,
        textColor=GRAY,
        fontName="Helvetica",
        leading=14,
        alignment=TA_RIGHT,
        spaceAfter=0,
    )

    date_style = ParagraphStyle(
        "Date",
        fontSize=10,
        textColor=GRAY,
        fontName="Helvetica",
        spaceBefore=14,
        spaceAfter=14,
    )

    body_style = ParagraphStyle(
        "Body",
        fontSize=10.5,
        textColor=BLACK,
        fontName="Helvetica",
        leading=17,
        alignment=TA_JUSTIFY,
        spaceAfter=12,
        spaceBefore=0,
    )

    sign_style = ParagraphStyle(
        "Sign",
        fontSize=10.5,
        textColor=BLACK,
        fontName="Helvetica",
        leading=17,
        spaceAfter=4,
    )

    sign_name_style = ParagraphStyle(
        "SignName",
        fontSize=10.5,
        textColor=DARK,
        fontName="Helvetica-Bold",
        leading=17,
    )

    story = []

    # ── Header: name (left) | contact (right) ───────────────
    contact_lines = []
    if contact["email"]:
        contact_lines.append(contact["email"])
    if contact["phone"]:
        contact_lines.append(contact["phone"])
    if contact["linkedin"]:
        contact_lines.append(contact["linkedin"])

    contact_block = Paragraph("<br/>".join(contact_lines) if contact_lines else "", contact_style)
    name_block = Paragraph(applicant_name.upper(), name_style)

    header_table = Table(
        [[name_block, contact_block]],
        colWidths=["60%", "40%"],
    )
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
        ("LEFTPADDING",  (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING",   (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)

    # ── Accent divider ───────────────────────────────────────
    story.append(Spacer(1, 10))
    story.append(HRFlowable(
        width="100%",
        thickness=2,
        color=ACCENT,
        spaceAfter=4,
    ))
    story.append(HRFlowable(
        width="100%",
        thickness=0.4,
        color=colors.HexColor("#E5E7EB"),
        spaceAfter=0,
    ))

    # ── Date ─────────────────────────────────────────────────
    story.append(Paragraph(date.today().strftime("%B %d, %Y"), date_style))

    # ── Body paragraphs ──────────────────────────────────────
    paragraphs = cover_letter_text.strip().split("\n\n")
    for para in paragraphs:
        clean = para.strip().replace("\n", " ")
        if clean:
            story.append(Paragraph(clean, body_style))

    # ── Signature ────────────────────────────────────────────
    story.append(Spacer(1, 18))
    story.append(Paragraph("Sincerely,", sign_style))
    story.append(Spacer(1, 28))   # space for handwritten sig
    story.append(Paragraph(applicant_name, sign_name_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()