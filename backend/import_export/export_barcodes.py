from io import BytesIO
from datetime import datetime, date

from rest_framework import status
from rest_framework.response import Response
from django.http import FileResponse
from backend.tables.serializers import ListInstrumentReadSerializer
from backend.tables.models import Instrument
from reportlab.graphics.barcode import code128
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter


def make_pdf(buffer, asset_tags, file_name):
    



def filter_instrument_pks(raw_pks):

    return True


def get_asset_tags(instrument_pks):

    tags = []
    for instrument_pk in instrument_pks:
        tags.append(Instrument.objects.get(instrument_pk).asset_tag)

    return tags


def handler(instrument_pks, select_all):
    if not select_all:
        asset_tags = get_asset_tags(instrument_pks)
    else:
        filtered_pks = filter_instrument_pks(instrument_pks)
        asset_tags = get_asset_tags(filtered_pks)

    buffer = make_pdf(BytesIO(), asset_tags)
    buffer.seek(0)

    filename = f"{date.today().strftime('%Y_%m_%d')}_barcodes.pdf"

    return FileResponse(buffer, as_attachment=True, filename=filename)