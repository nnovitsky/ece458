from io import BytesIO
from datetime import date, datetime
import zipfile
import pytz
import pandas as pd

from django.http import FileResponse, HttpResponse
from rest_framework import status
from rest_framework.response import Response
from backend.config.export_flags import MODEL_EXPORT, INSTRUMENT_EXPORT, ZIP_EXPORT

image_types = ['gif', 'jpg', 'png']
model_headers = ['Vendor', 'Model-Number', 'Short-Description', 'Comment', 'Model-Categories', 'Load-Bank-Support',
                 'Calibration-Frequency']
instrument_headers = ['Vendor', 'Model-Number', 'Serial-Number', 'Asset-Tag', 'Comment', 'Calibration-Date',
                      'Calibration-Comment', 'Instrument-Categories', 'Calibration-File-Attachment',
                      'Calibration-Load-Bank-Result-Exists']


def get_model_categories(model):
    cats = [cat.name for cat in model.itemmodelcategory_set.all()]

    if len(cats) > 0:
        return " ".join(cats)

    return ""


def get_load_bank_compatibility(model):
    modes = model.calibrationmode_set.all()

    if len(modes) > 0 and modes[0].name == 'load_bank':
        return "Y"

    return ""


def write_model_sheet(db_models, buffer):
    model_list = []
    for db_model in db_models:
        model_categories = get_model_categories(db_model)
        load_bank_support = get_load_bank_compatibility(db_model)

        model_row = [
            str(db_model.vendor),
            str(db_model.model_number),
            str(db_model.description),
            str(db_model.comment),
            model_categories,
            load_bank_support,
            str(db_model.calibration_frequency)
        ]
        model_list.append(model_row)

    model_sheet = pd.DataFrame(model_list, columns=model_headers)
    model_sheet.to_csv(buffer, index=False, encoding='utf-8-sig')
    buffer.seek(0)

    return buffer, f"model_export_{datetime.now(pytz.timezone('America/New_York')).strftime('%Y_%m_%d')}.csv"


def get_instrument_categories(instrument):
    cats = [cat.name for cat in instrument.instrumentcategory_set.all()]

    if len(cats) > 0:
        return " ".join(cats)

    return ""


def get_file_info(db_instrument):
    file_name = None
    most_recent_cal = db_instrument.calibrationevent_set.order_by('-date')[:1]

    if len(most_recent_cal) != 0:
        file_name = str(most_recent_cal[0].file)

    if file_name is None or file_name.strip() == '':
        return ""

    file_ext = file_name.split('.')[-1]

    if file_ext.lower() in image_types:
        return f"Attachment: {file_ext.upper()} image"

    return f"Attachment: {file_ext.upper()} file"


def check_calibration_for_lb(instrument):
    most_recent_cal = instrument.calibrationevent_set.order_by('-date')[:1]

    if len(most_recent_cal) != 0:
        file_type = most_recent_cal[0].file_type
        if file_type == 'Load Bank':
            return "Calibration via load-bank wizard"

    return ""


def write_instrument_sheet(db_instruments, buffer):
    instrument_list = []
    for db_instrument in db_instruments:
        instrument_model = db_instrument.item_model

        categories = get_instrument_categories(db_instrument)
        file_info = get_file_info(db_instrument)
        load_bank_check = check_calibration_for_lb(db_instrument)

        if instrument_model.calibration_frequency < 1:
            cal_date = ""
            cal_comment = ""
        else:
            last_cal = db_instrument.calibrationevent_set.order_by('-date')[:1]
            cal_date = '' if len(last_cal) == 0 else last_cal[0].date
            cal_comment = 'Requires calibration' if len(last_cal) == 0 else last_cal[0].comment

        instrument_row = [
            str(instrument_model.vendor),
            str(instrument_model.model_number),
            str(db_instrument.serial_number),
            str(db_instrument.asset_tag),
            str(db_instrument.comment),
            cal_date,
            cal_comment,
            categories,
            file_info,
            load_bank_check
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
        response = FileResponse(output_buffer, as_attachment=True, filename=file_name, content_type='text/csv')
    elif export_code == INSTRUMENT_EXPORT:
        output_buffer, file_name = write_instrument_sheet(queryset['instruments'], BytesIO())
        response = FileResponse(output_buffer, as_attachment=True, filename=file_name, content_type='text/csv')
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
