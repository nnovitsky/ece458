from io import BytesIO
from datetime import date, datetime
import zipfile
import pytz

import pandas as pd

from django.http import FileResponse, HttpResponse
from rest_framework import status
from rest_framework.response import Response
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

    return buffer, f"model_export_{datetime.now(pytz.timezone('America/New_York')).strftime('%Y_%m_%d')}.csv"


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

    return buffer, f"instrument_export_{datetime.now(pytz.timezone('America/New_York')).strftime('%Y_%m_%d')}.csv"


def zip_files(model_buffer, model_file_name, instrument_buffer, instrument_file_name):
    mem_zip = BytesIO()
    with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(model_file_name, model_buffer.getvalue())
        zf.writestr(instrument_file_name, instrument_buffer.getvalue())
    return mem_zip.getbuffer(), f"zip_export_{datetime.now(pytz.timezone('America/New_York')).strftime('%Y_%m_%d')}.zip"


def handler(queryset, export_code):

    if export_code == MODEL_EXPORT:
        output_buffer, file_name = write_model_sheet(queryset['models'], BytesIO())
        response = FileResponse(output_buffer, as_attachment=True, filename=file_name)
    elif export_code == INSTRUMENT_EXPORT:
        output_buffer, file_name = write_instrument_sheet(queryset['instruments'], BytesIO())
        response = FileResponse(output_buffer, as_attachment=True, filename=file_name)
    elif export_code == ZIP_EXPORT:
        model_buffer, model_file_name = write_model_sheet(queryset['models'], BytesIO())
        instrument_buffer, instrument_file_name = write_instrument_sheet(queryset['instruments'], BytesIO())
        output_buffer, file_name = zip_files(model_buffer, model_file_name, instrument_buffer, instrument_file_name)
        response = HttpResponse(output_buffer, content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename={file_name}'
    else:
        return Response({"description": ["invalid status code for export config"]}, status=status.HTTP_418_IM_A_TEAPOT)

    try:
        return response
    except IOError:
        return Response(status=status.HTTP_418_IM_A_TEAPOT)
