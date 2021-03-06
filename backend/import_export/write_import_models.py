import csv
import io

from backend.tables.serializers import ItemModelSerializer, ItemModelNoCategoriesSerializer
from backend.tables.models import ItemModelCategory
from backend.import_export.field_validators import is_blank_row

# TODO: handle load bank cell after "calibration-mode" field decided upon for ItemModels
# model_keys = ['vendor', 'model_number', 'description', 'comment', 'itemmodelcategory_set',
#               'load_bank_support', 'calibration_frequency']

model_keys = ['vendor', 'model_number', 'description', 'comment', 'calibration_frequency']
keys_no_category = ['vendor', 'model_number', 'description', 'comment', 'calibration_frequency']
keys_category = ['vendor', 'model_number', 'description', 'comment', 'itemmodelcategory_set',
                 'calibration_frequency']

VENDOR_INDEX = 0
MODEL_NUM_INDEX = 1
DESC_INDEX = 2
COMMENT_INDEX = 3
MODEL_CATEGORIES_INDEX = 4
LOAD_BANK_INDEX = 5
CAL_FREQUENCY_INDEX = 6


def get_no_category_record(row):
    if row[CAL_FREQUENCY_INDEX] == 'N/A':
        cal_freq = 0
    else:
        cal_freq = int(row[CAL_FREQUENCY_INDEX])

    model_info = [row[VENDOR_INDEX], row[MODEL_NUM_INDEX], row[DESC_INDEX],
                  row[COMMENT_INDEX], cal_freq]
    model_record = dict(zip(keys_no_category, model_info))

    return model_record


def get_category_record(row):
    if row[CAL_FREQUENCY_INDEX] == 'N/A':
        cal_freq = 0
    else:
        cal_freq = int(row[CAL_FREQUENCY_INDEX])

    model_category_set = set()
    for category in row[MODEL_CATEGORIES_INDEX].strip().split(' '):
        category_pk = ItemModelCategory.objects.filter(name=category)[0].pk
        model_category_set.add(category_pk)

    model_info = [row[VENDOR_INDEX], row[MODEL_NUM_INDEX], row[DESC_INDEX],
                  row[COMMENT_INDEX], model_category_set, cal_freq]
    model_record = dict(zip(keys_category, model_info))

    return model_record


def get_model_list(file):
    category_models = []
    no_category_models = []

    file.seek(0)
    reader = csv.reader(io.StringIO(file.read().decode('utf-8')))
    headers = next(reader)
    for row in reader:
        if is_blank_row(row):
            continue

        if len(row[MODEL_CATEGORIES_INDEX].strip()) == 0:
            no_category_models.append(get_no_category_record(row))
        else:
            category_models.append(get_category_record(row))

    return no_category_models, category_models


def handler(verified_file):
    db_cat_upload = ''
    db_no_cat_upload = ''

    no_category_models, category_models = get_model_list(verified_file)
    if len(no_category_models) > 0:
        db_no_cat_upload = ItemModelNoCategoriesSerializer(data=no_category_models, many=True)
        if not db_no_cat_upload.is_valid():
            return False, None, "Error writing non-category models to db."

    print("non-category upload was valid!")
    if len(category_models) > 0:
        db_cat_upload = ItemModelSerializer(data=category_models, many=True)
        print("db_cat_upload: ", db_cat_upload)
        if not db_cat_upload.is_valid():
            print("db_category_upload_response: ", str(db_cat_upload.is_valid()))
            return False, None, "Error writing category models to db."

    upload_list = []

    if db_no_cat_upload: upload_list += db_no_cat_upload.save()
    if db_cat_upload: upload_list += db_cat_upload.save()

    upload_summary = f"Successfully wrote {len(no_category_models) + len(category_models)} model(s) to the database."
    print("upload_list: ", upload_list)
    return True, upload_list, upload_summary
