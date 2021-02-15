from io import StringIO
from datetime import date

import pandas as pd

from django.http import FileResponse
from rest_framework import status
from rest_framework.response import Response
from backend.tables.models import ItemModel, Instrument, CalibrationEvent

model_headers = ['Vendor', 'Model-Number', 'Short-Description', 'Comment', 'Calibration-Frequency']
instrument_headers = ['Vendor', 'Model-Number', 'Serial-Number', 'Comment', 'Calibration-Date', 'Calibration-Comment']

MODEL_EXPORT = 0
INSTRUMENT_EXPORT = 1
ZIP_EXPORT = 2


def write_model_sheet(buffer):
    model_list = []
    db_models = ItemModel.objects.all()
    for db_model in db_models:
        model_row = [
            str(db_model.vendor),
            str(db_model.model_number),
            str(db_model.short_description),
            str(db_model.comment),
            str(db_model.calibration_frequency)
        ]
        model_list.append(model_row)

    model_sheet = pd.DataFrame(model_list, columns=model_headers, index=False)
    file_name = f"model_export_{date.today().strftime('%Y_%m_%d')}.csv"
    model_sheet.to_csv(file_name)
    return buffer, file_name


def write_instrument_sheet():
    instrument_list = []
    db_instruments = Instrument.objects.all()


    return True


def zip_files():

    return True


def handler(export_code):

    if export_code == MODEL_EXPORT:
        output_buffer, file_name = write_model_sheet(StringIO())
    elif export_code == INSTRUMENT_EXPORT:
        output_buffer, file_name = write_instrument_sheet(StringIO())
    elif export_code == ZIP_EXPORT:
        model_buffer = write_model_sheet()
        instrument_buffer = write_instrument_sheet()
        zip_files()
    else:
        print("invalid status code")

    try:
        return FileResponse(output_buffer, as_attachment=True, filename=file_name)
    except IOError:
        return Response(status=status.HTTP_418_IM_A_TEAPOT)

