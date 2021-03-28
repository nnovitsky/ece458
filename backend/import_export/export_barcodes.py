from io import BytesIO
from datetime import date

from django.http import FileResponse
from backend.tables.models import Instrument
from reportlab.graphics.barcode import code128
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

SIDE_MARGIN = 0.33*inch
TOP_MARGIN = 0.5*inch
HORIZONTAL_GAP = 0.28125*inch
BARCODE_HEIGHT = 0.5*inch
BARCODE_WIDTH = 1.75*inch
PAGE_WIDTH = 8.5*inch
PAGE_HEIGHT = 11*inch

TAGS_PER_PAGE = 80

N_COLUMNS = 4
N_ROWS = 20


def split_tags(asset_tags):

    for i in range(0, len(asset_tags), TAGS_PER_PAGE):
        yield asset_tags[i: i + TAGS_PER_PAGE]


def make_pdf(asset_tags):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=(PAGE_WIDTH, PAGE_HEIGHT))
    asset_tags.sort()

    page_index = 0
    for page in split_tags(asset_tags):
        c.setFont("Helvetica", size=10)
        c.saveState()
        tag_index = 0

        for row in range(N_ROWS):
            for col in range(N_COLUMNS):
                if len(page) > tag_index:
                    # DRAW BOX
                    box_x = SIDE_MARGIN + col * (BARCODE_WIDTH + HORIZONTAL_GAP)
                    box_y = (PAGE_HEIGHT - TOP_MARGIN - BARCODE_HEIGHT) - row * BARCODE_HEIGHT
                    c.rect(x=box_x, y=box_y, width=BARCODE_WIDTH, height=BARCODE_HEIGHT)

                    # DRAW BARCODE
                    barcode = code128.Code128(str(asset_tags[tag_index + page_index*TAGS_PER_PAGE]), barWidth=1.3)
                    barcode.drawOn(c, box_x + 3, box_y + 0.2 * inch)

                    # DRAW LABEL
                    c.drawString(box_x + 3, box_y + 4, "HPT Asset")
                    c.drawString(box_x + 1.2 * inch, box_y + 4, str(asset_tags[tag_index + page_index*TAGS_PER_PAGE]))
                    tag_index += 1

        c.showPage()
        page_index += 1

    c.save()
    buffer.seek(0)
    return buffer



def get_asset_tags(instrument_pks):

    tags = []
    for instrument_pk in instrument_pks:
        tags.append(Instrument.objects.get(pk=instrument_pk).asset_tag)

    return tags


def handler(instrument_pks):

    asset_tags = get_asset_tags(instrument_pks)
    buffer = make_pdf(asset_tags)

    filename = f"{date.today().strftime('%Y_%m_%d')}_barcodes.pdf"
    return FileResponse(buffer, as_attachment=True, filename=filename)
