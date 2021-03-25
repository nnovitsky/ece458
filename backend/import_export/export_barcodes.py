from io import BytesIO
from datetime import datetime, date

from rest_framework import status
from rest_framework.response import Response
from django.http import FileResponse
from backend.tables.serializers import ListInstrumentReadSerializer
from backend.tables.models import Instrument


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

    filename = f"{date.today().strftime('%Y_%m_%d')}_barcodes.pdf"
    return False