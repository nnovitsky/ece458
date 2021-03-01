import csv
import io

from backend.tables.serializers import ItemModelSerializer
from backend.import_export.field_validators import is_blank_row

model_keys = ['vendor', 'model_number', 'description', 'comment', 'itemmodelcategory_set',
              'load_bank_support', 'calibration_frequency']

VENDOR_INDEX = 0
MODEL_NUM_INDEX = 1
DESC_INDEX = 2
COMMENT_INDEX = 3
MODEL_CATEGORIES_INDEX = 4
LOAD_BANK_INDEX = 5
CAL_FREQUENCY_INDEX = 6


def get_model_list(file):
    model_records = []

    file.seek(0)
    reader = csv.reader(io.StringIO(file.read().decode('utf-8')))
    headers = next(reader)
    for row in reader:
        if is_blank_row(row):
            continue

        if row[CAL_FREQUENCY_INDEX] == 'N/A':
            cal_freq = 0
        else:
            cal_freq = int(row[CAL_FREQUENCY_INDEX])

        model_info = [row[VENDOR_INDEX], row[MODEL_NUM_INDEX], row[DESC_INDEX],
                      row[COMMENT_INDEX], row[MODEL_CATEGORIES_INDEX], row[LOAD_BANK_INDEX], cal_freq]
        model_record = dict(zip(model_keys, model_info))
        model_records.append(model_record)

    return model_records


def handler(verified_file):

    model_data = get_model_list(verified_file)
    db_model_upload = ItemModelSerializer(data=model_data, many=True)

    if not db_model_upload.is_valid():
        return False, None, "Error writing models to db."

    upload_results = db_model_upload.save()

    upload_summary = f"Successfully wrote {len(model_data)} model(s) to the database."
    return True, upload_results, upload_summary
