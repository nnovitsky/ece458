import csv
import io
import datetime

from backend.tables.models import ItemModel, Instrument, CalibrationEvent
from backend.tables.serializers import ItemModelSerializer, InstrumentWriteSerializer, CalibrationEventWriteSerializer
from backend.import_export.field_validators import is_blank_row
from django.contrib.auth.models import User

instrument_keys = ['item_model', 'serial_number', 'comment']
cal_event_keys = ['date', 'user', 'instrument','comment']
record_keys = ['vendor', 'model_number', 'serial_number', 'comment', 'calibration_date', 'calibration_comment']
VENDOR_INDEX = 0
MODEL_NUM_INDEX = 1
SERIAL_NUM_INDEX = 2
COMMENT_INDEX = 3
CAL_DATE_INDEX = 4
CAL_COMMENT_INDEX = 5


def upload_instrument(current_row, item_model):

    instrument_info = [item_model.pk, current_row[SERIAL_NUM_INDEX], current_row[COMMENT_INDEX]]
    instrument_raw_data = dict(zip(instrument_keys, instrument_info))
    instrument_upload = InstrumentWriteSerializer(data=instrument_raw_data)
    if instrument_upload.is_valid():
        current_instrument = instrument_upload.save()
        return True, current_instrument
    else:
        return False, []


def reformat_date(MM_DD_YYYY):
    year = int(MM_DD_YYYY[6:10])
    day = int(MM_DD_YYYY[3:5])
    month = int(MM_DD_YYYY[0:2])
    return datetime.date(year, month, day)


def upload_cal_event(current_row, current_instrument, user):
    db_date = reformat_date(current_row[CAL_DATE_INDEX])
    cal_event_info = [db_date, user.pk, current_instrument.pk, current_row[CAL_COMMENT_INDEX]]
    cal_event_data = dict(zip(cal_event_keys, cal_event_info))
    cal_event_upload = CalibrationEventWriteSerializer(data=cal_event_data)
    if cal_event_upload.is_valid():

        cal_event_upload.save()
        return True

    return False


def get_instrument_list(file, user):
    instrument_raw_data = []
    instruments = []

    file.seek(0)
    reader = csv.reader(io.StringIO(file.read().decode('utf-8-sig')))
    headers = next(reader)
    for row in reader:
        if is_blank_row(row):
            continue

        instrument_raw_data.append(dict(zip(record_keys, row)))

        item_model = ItemModel.objects.filter(vendor=row[VENDOR_INDEX]).filter(model_number=row[MODEL_NUM_INDEX])[0]
        instrument_upload_success, current_instrument = upload_instrument(row, item_model)

        if not instrument_upload_success:
            return False, [], "Failed to upload instruments to db"

        if item_model.calibration_frequency != 0:
            cal_event_upload_success = upload_cal_event(row, current_instrument, user)
            if not cal_event_upload_success:
                return False, [], "Failed to upload cal events to db"

        instruments.append(current_instrument)

    return True, instruments, f"Uploaded {len(instrument_raw_data)} records to db"


def handler(verified_file, request):
    user = request.user
    successful_upload, instruments, upload_summary = get_instrument_list(verified_file, user)
    return successful_upload, instruments, upload_summary
