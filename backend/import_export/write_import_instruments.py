import csv
import io
import datetime

from django.db import transaction
from django.contrib.auth.models import User

from backend.tables.models import ItemModel, Instrument, CalibrationEvent, InstrumentCategory
from backend.tables.serializers import ItemModelSerializer, InstrumentWriteSerializer, \
                                       CalibrationEventWriteSerializer, InstrumentCategorySerializer
from backend.import_export.field_validators import is_blank_row


at_pointer = 100000
instrument_keys = ['item_model', 'asset_tag', 'serial_number', 'comment', 'instrumentcategory_set']
cal_event_keys = ['date', 'user', 'instrument', 'comment']

VENDOR_INDEX = 0
MODEL_NUM_INDEX = 1
SERIAL_NUM_INDEX = 2
ASSET_TAG_INDEX = 3
COMMENT_INDEX = 4
CAL_DATE_INDEX = 5
CAL_COMMENT_INDEX = 6
CATEGORIES_INDEX = 7


def get_instrument_category_set(row, db_categories):
    instrument_category_set = set()
    row_categories = row[CATEGORIES_INDEX].strip()

    if len(row_categories) > 0:
        for category in row_categories.split(' '):
            if category not in db_categories:
                cat_to_add = InstrumentCategorySerializer(data={"name": category})
                if cat_to_add.is_valid(): cat_to_add.save()
                db_categories.append(category)

            category_pk = InstrumentCategory.objects.filter(name=category)[0].pk
            instrument_category_set.add(category_pk)

    return instrument_category_set


def get_valid_asset_tag(row, db_asset_tags):
    global at_pointer

    if row[ASSET_TAG_INDEX].strip() == '':
        while at_pointer in db_asset_tags:
            at_pointer += 1
    else:
        return int(row[ASSET_TAG_INDEX])

    return at_pointer


def upload_instrument(current_row, item_model, db_asset_tags, db_categories):

    categories = get_instrument_category_set(current_row, db_categories)
    asset_tag = get_valid_asset_tag(current_row, db_asset_tags)

    serial_num = None if current_row[SERIAL_NUM_INDEX].strip() == '' else current_row[SERIAL_NUM_INDEX]
    instrument_info = [item_model.pk, asset_tag, serial_num, current_row[COMMENT_INDEX],
                       list(categories)]
    instrument_raw_data = dict(zip(instrument_keys, instrument_info))
    instrument_upload = InstrumentWriteSerializer(data=instrument_raw_data)
    if instrument_upload.is_valid():
        current_instrument = instrument_upload.save()
        db_asset_tags.add(asset_tag)
        for cat_pk in categories:
            db_categories.append(InstrumentCategory.objects.get(pk=cat_pk).name)
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


def get_assigned_asset_tags(reader, db_asset_tags):
    next(reader)

    for row in reader:
        if row[ASSET_TAG_INDEX].strip() == '':
            continue

        db_asset_tags.add(int(row[ASSET_TAG_INDEX]))


def get_instrument_list(file, user):
    n_uploads = 0
    asset_tags = []
    db_categories = list(InstrumentCategory.objects.values_list('name', flat=True))
    db_asset_tags = set(Instrument.objects.values_list('asset_tag', flat=True))

    file.seek(0)
    reader = csv.reader(io.StringIO(file.read().decode('utf-8-sig')))
    get_assigned_asset_tags(reader, db_asset_tags)

    file.seek(0)
    reader = csv.reader(io.StringIO(file.read().decode('utf-8-sig')))
    headers = next(reader)

    for row in reader:
        if is_blank_row(row):
            continue

        item_model = ItemModel.objects.filter(vendor=row[VENDOR_INDEX]).filter(model_number=row[MODEL_NUM_INDEX])[0]
        instrument_upload_success, current_instrument = upload_instrument(row, item_model, db_asset_tags, db_categories)

        if not instrument_upload_success:
            return False, [], "Failed to upload instruments to db"

        if item_model.calibration_frequency != 0:
            cal_event_upload_success = upload_cal_event(row, current_instrument, user)
            if not cal_event_upload_success:
                return False, [], "Failed to upload cal events to db"

        asset_tags.append(current_instrument.asset_tag)

    return True, asset_tags, f"Uploaded {n_uploads} records to db"


def handler(verified_file, request):
    user = request.user
    try:
        with transaction.atomic():
            successful_upload, asset_tags, upload_summary = get_instrument_list(verified_file, user)
    except IOError:
        return False, None, "Error writing instruments to database."

    return successful_upload, asset_tags, upload_summary
