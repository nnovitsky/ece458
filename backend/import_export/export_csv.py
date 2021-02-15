from io import BytesIO
from datetime import date
from zipfile import ZipFile

import pandas as pd

from django.http import FileResponse
from rest_framework import status
from rest_framework.response import Response
from backend.tables.models import ItemModel, Instrument, CalibrationEvent
from backend.config.export_flags import MODEL_EXPORT, INSTRUMENT_EXPORT, ZIP_EXPORT

model_headers = ['Vendor', 'Model-Number', 'Short-Description', 'Comment', 'Calibration-Frequency']
instrument_headers = ['Vendor', 'Model-Number', 'Serial-Number', 'Comment', 'Calibration-Date', 'Calibration-Comment']


def write_model_sheet(db_models, buffer):
    model_list = []
    for db_model in db_models:
        model_row = [
            str(db_model.vendor),
            str(db_model.model_number),
            str(db_model.description),
            str(db_model.comment),
            str(db_model.calibration_frequency)
        ]
        model_list.append(model_row)

    model_sheet = pd.DataFrame(model_list, columns=model_headers)
    model_sheet.to_csv(buffer, index=False)
    buffer.seek(0)

    return buffer, f"model_export_{date.today().strftime('%Y_%m_%d')}.csv"


def write_instrument_sheet(db_instruments, buffer):
    instrument_list = []
    for db_instrument in db_instruments:
        instrument_model = db_instrument.item_model

        if instrument_model.calibration_frequency < 1:
            cal_date = ""
            cal_comment = ""
        else:
            last_cal = db_instrument.calibrationevent_set.order_by('date')[:1]
            cal_date = '' if len(last_cal) == 0 else last_cal[0].date
            cal_comment = 'Requires calibration' if len(last_cal) == 0 else last_cal[0].comment

        instrument_row = [
            str(instrument_model.vendor),
            str(instrument_model.model_number),
            str(db_instrument.serial_number),
            str(db_instrument.comment),
            cal_date,
            cal_comment
        ]

        instrument_list.append(instrument_row)

    instrument_sheet = pd.DataFrame(instrument_list, columns=instrument_headers)
    instrument_sheet.to_csv(buffer, index=False)
    buffer.seek(0)

    return buffer, f"instrument_export_{date.today().strftime('%Y_%m_%d')}.csv"


def zip_files():

    return True


def handler(queryset, export_code):

    if export_code == MODEL_EXPORT:
        output_buffer, file_name = write_model_sheet(queryset, BytesIO())
    elif export_code == INSTRUMENT_EXPORT:
        output_buffer, file_name = write_instrument_sheet(queryset, BytesIO())
    elif export_code == ZIP_EXPORT:
        model_buffer = write_model_sheet()
        instrument_buffer = write_instrument_sheet()
        zip_files()
    else:
        return Response({"description": ["invalid status code for export config"]}, status=status.HTTP_418_IM_A_TEAPOT)

    try:
        return FileResponse(output_buffer, as_attachment=True, filename=file_name)
    except IOError:
        return Response(status=status.HTTP_418_IM_A_TEAPOT)
