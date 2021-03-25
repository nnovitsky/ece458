from io import BytesIO
from datetime import datetime, date

from rest_framework import status
from rest_framework.response import Response
from django.http import FileResponse
from backend.tables.serializers import ListInstrumentReadSerializer


def get_asset_tags(instrument_pks):


    return True


def handler(instrument_pks, select_all):
    if not select_all:
        asset_tags = get_asset_tags(instrument_pks)
    else:
        print('')

    filename = f"{date.today().strftime('%Y_%m_%d')}_barcodes.pdf"
    return False