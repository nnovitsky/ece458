import csv
import io

from django.db import transaction

from backend.tables.serializers import ItemModelSerializer, ItemModelNoCategoriesSerializer, ItemModelCategorySerializer
from backend.tables.models import ItemModelCategory, CalibrationMode
from backend.import_export.field_validators import is_blank_row

model_keys = ['vendor', 'model_number', 'description', 'comment', 'calibration_frequency',
              'itemmodelcategory_set', 'calibrationmode_set', 'requires_approval', 'calibrator_categories_set']

VENDOR_INDEX = 0
MODEL_NUM_INDEX = 1
DESC_INDEX = 2
COMMENT_INDEX = 3
MODEL_CATEGORIES_INDEX = 4
CALIBRATION_SUPPORT_INDEX = 5
CAL_FREQUENCY_INDEX = 6
REQUIRES_APPROVAL_INDEX = 7
CAL_CATEGORIES_INDEX = 8


def get_klufe_pk():
    try:
        klufe_pk = CalibrationMode.objects.get(name='klufe_k5700').pk
    except CalibrationMode.DoesNotExist:
        cal_mode = CalibrationMode(name='klufe_k5700')
        cal_mode.save()
        klufe_pk = cal_mode.pk

    return klufe_pk


def get_load_bank_pk():
    try:
        load_bank_pk = CalibrationMode.objects.get(name='load_bank').pk
    except CalibrationMode.DoesNotExist:
        cal_mode = CalibrationMode(name="load_bank")
        cal_mode.save()
        load_bank_pk = cal_mode.pk

    return load_bank_pk


def get_cal_fields(row, load_bank_pk, klufe_pk):

    if row[CAL_FREQUENCY_INDEX] == 'N/A':
        cal_freq = 0
    else:
        cal_freq = int(row[CAL_FREQUENCY_INDEX])

    if len(row[CALIBRATION_SUPPORT_INDEX].strip()) == 0:
        cal_mode = []
    elif row[CALIBRATION_SUPPORT_INDEX].strip() == 'Load-Bank':
        cal_mode = [load_bank_pk]
    elif row[CALIBRATION_SUPPORT_INDEX].strip() == 'Klufe':
        cal_mode = [klufe_pk]
    else:
        print("Uncaught exception for calibration mode validation")

    return cal_freq, cal_mode


def get_model_category_set(row, db_categories):
    model_category_set = set()
    row_categories = row[MODEL_CATEGORIES_INDEX].strip()

    if len(row_categories) > 0:
        for category in row_categories.split(' '):
            if category not in db_categories:
                cat_to_add = ItemModelCategorySerializer(data={"name": category})
                if cat_to_add.is_valid(): cat_to_add.save()
                db_categories.append(category)

            category_pk = ItemModelCategory.objects.filter(name=category)[0].pk
            model_category_set.add(category_pk)

    return model_category_set


def get_model_list(file, load_bank_pk, klufe_pk, db_categories):
    model_records = []

    file.seek(0)
    reader = csv.reader(io.StringIO(file.read().decode('utf-8-sig')))
    headers = next(reader)
    for row in reader:
        if is_blank_row(row):
            continue

        cal_freq, cal_mode = get_cal_fields(row, load_bank_pk, klufe_pk)
        model_category_set = get_model_category_set(row, db_categories)
        requires_approval = row[REQUIRES_APPROVAL_INDEX] == 'Y'

        model_info = [row[VENDOR_INDEX], row[MODEL_NUM_INDEX], row[DESC_INDEX], row[COMMENT_INDEX], cal_freq,
                      list(model_category_set), cal_mode, requires_approval]
        model_records.append(dict(zip(model_keys, model_info)))

    return model_records


def handler(verified_file):
    load_bank_pk = get_load_bank_pk()
    klufe_pk = get_klufe_pk()
    db_categories = list(ItemModelCategory.objects.values_list('name', flat=True))

    try:
        with transaction.atomic():
            model_data = get_model_list(verified_file, load_bank_pk, klufe_pk, db_categories)
            db_model_upload = ItemModelSerializer(data=model_data, many=True)
            if db_model_upload.is_valid(): upload_results = db_model_upload.save()
    except IOError:
        return False, None, f"Error writing models to db: {db_model_upload.errors}"

    upload_summary = f"Successfully wrote {len(model_data)} model(s) to the database."
    return True, upload_results, upload_summary
