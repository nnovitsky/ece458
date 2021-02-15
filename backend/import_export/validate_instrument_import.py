import csv
import io

from backend.import_export import field_validators
from backend.tables.models import ItemModel, Instrument

column_types = [
    'Vendor',
    'Model-Number',
    'Serial-Number',
    'Comment',
    'Calibration-Date',
    'Calibration-Comment',
]

VENDOR_INDEX = 0
MODEL_NUM_INDEX = 1
SERIAL_NUM_INDEX = 2

sheet_models = []
sheet_instruments = []


def validate_row(current_row):

    if len(current_row) != len(column_types):
        return False, f"Row length mismatch. Expected {len(column_types)} " \
                      f"but received {len(current_row)} items."

    sheet_models.append(current_row[VENDOR_INDEX] + " " + current_row[MODEL_NUM_INDEX])
    sheet_instruments.append(current_row[VENDOR_INDEX] + " " + current_row[MODEL_NUM_INDEX] +
                             " " + current_row[SERIAL_NUM_INDEX])

    for item, column_type in zip(current_row, column_types):

        if column_type == 'Vendor':
            valid_cell, info = field_validators.is_valid_vendor(item)
        elif column_type == 'Model-Number':
            valid_cell, info = field_validators.is_valid_model_num(item)
        elif column_type == 'Serial-Number':
            valid_cell, info = field_validators.is_valid_serial_num(item)
        elif column_type == 'Comment':
            valid_cell, info = field_validators.is_valid_comment(item)
        elif column_type == 'Calibration-Date':
            this_model = ItemModel.objects.filter(
                vendor=current_row[VENDOR_INDEX]).filter(model_number=current_row[MODEL_NUM_INDEX])[0]
            is_calibratable = False if this_model.calibration_frequency < 1 else True
            valid_cell, info = field_validators.is_valid_calibration_date(item, is_calibratable)
        elif column_type == 'Calibration-Comment':
            valid_cell, info = field_validators.is_valid_comment(item)

        if not valid_cell:
            return False, info

    return True, "Valid Row"


def check_models():
    
    db_models = []
    for db_model in ItemModel.objects.all():
        db_models.append(str(db_model))
    for model in sheet_models:
        if model not in db_models:
            return True, f"Model {model} referenced in sheet does not exist in database."

    return False, "All models exist within db."


def contains_duplicates():

    if len(sheet_instruments) != len(set(sheet_instruments)):
        return True, "Duplicate instruments contained within the imported sheet."

    db_instruments = Instrument.objects.all()
    for db_instrument in db_instruments:
        if str(db_instrument) in sheet_instruments:
            return True, f"Duplicate instrument ({db_instrument}) already exists in database"

    return False, "No Duplicates!"


def handler(uploaded_file):
    sheet_models.clear()
    sheet_instruments.clear()
    
    uploaded_file.seek(0)
    reader = csv.reader(io.StringIO(uploaded_file.read().decode('utf-8')))

    headers = next(reader)
    has_valid_columns, header_log = field_validators.validate_column_headers(headers, column_types)
    if not has_valid_columns:
        return False, header_log

    row_number = 1
    for row in reader:
        valid_row, row_info = validate_row(row)
        if not valid_row:
            return False, f"Row {row_number} malformed input: {row_info}"

        row_number += 1

    model_dne, model_dne_info = check_models()
    if model_dne:
        return False, f"Invalid input: " + model_dne_info

    duplicate_error, duplicate_info = contains_duplicates()
    if duplicate_error:
        return False, f"Duplicate input: " + duplicate_info

    return True, "Correct formatting."
