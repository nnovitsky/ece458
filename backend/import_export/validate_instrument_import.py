import csv
import io

from backend.import_export import field_validators
from backend.tables.models import ItemModel, Instrument, InstrumentCategory

column_types = [
    'Vendor',
    'Model-Number',
    'Serial-Number',
    'Asset-Tag-Number',
    'Comment',
    'Calibration-Date',
    'Calibration-Comment',
    'Instrument-Categories'
]

VENDOR_INDEX = 0
MODEL_NUM_INDEX = 1
SERIAL_NUM_INDEX = 2

sheet_models = []
sheet_instruments = []
asset_tags = []
sheet_categories = []
vend_model_serial = []


def validate_row(current_row):

    if len(current_row) < len(column_types):
        return False, f"Missing values: Expected {len(column_types)} " \
                      f"but received {len(current_row)} items."

    if field_validators.is_blank_row(current_row):
        return True, "Blank row."

    sheet_models.append(current_row[VENDOR_INDEX] + " " + current_row[MODEL_NUM_INDEX])
    sheet_instruments.append(current_row[VENDOR_INDEX] + " " + current_row[MODEL_NUM_INDEX] +
                             " " + current_row[SERIAL_NUM_INDEX])

    if len(current_row[SERIAL_NUM_INDEX].strip()) != 0:
        instrument_vms = current_row[VENDOR_INDEX] + " " + current_row[MODEL_NUM_INDEX] + " " + current_row[
            SERIAL_NUM_INDEX]

        if instrument_vms in vend_model_serial:
            return False, f"Duplicate instrument within sheet: {instrument_vms}."
        else:
            vend_model_serial.append(instrument_vms)


    for item, column_type in zip(current_row, column_types):

        if column_type == 'Vendor':
            valid_cell, info = field_validators.is_valid_vendor(item)
        elif column_type == 'Model-Number':
            valid_cell, info = field_validators.is_valid_model_num(item)
        elif column_type == 'Serial-Number':
            valid_cell, info = field_validators.is_valid_serial_num(item)
        elif column_type == 'Asset-Tag-Number':
            valid_cell, info = field_validators.is_valid_asset_tag(item)
            if len(item.strip()) > 0:
                asset_tags.append(int(item))
        elif column_type == 'Comment':
            valid_cell, info = field_validators.is_valid_comment(item)
        elif column_type == 'Instrument-Categories':
            valid_cell, info = field_validators.is_valid_instrument_categories(item)
            for category in item.strip().split(' '):
                sheet_categories.append(category)
        elif column_type == 'Calibration-Date':
            try:
                this_model = ItemModel.objects.filter(
                    vendor=current_row[VENDOR_INDEX]).filter(model_number=current_row[MODEL_NUM_INDEX])[0]
            except IndexError:
                return False, "No model instances of this instrument exist in db"

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

    db_instruments = Instrument.objects.all()
    for db_instrument in db_instruments:
        if str(db_instrument) in sheet_instruments:
            return True, f"Duplicate instrument ({db_instrument}) already exists in database"

    return False, "No Duplicates!"


def validate_asset_tags():
    if len(asset_tags) == 0:
        return False, "no manual assignments."

    if len(asset_tags) != len(set(asset_tags)):
        return True, "Duplicate asset tags assigned within import."

    db_asset_tags = set(Instrument.objects.values_list('asset_tag', flat=True))
    for asset_tag in asset_tags:
        if asset_tag in db_asset_tags:
            return True, f"asset tag {asset_tag} already exists in database."

    return False, "Valid set of asset tags"


def handler(uploaded_file):
    sheet_models.clear()
    sheet_instruments.clear()
    asset_tags.clear()
    sheet_categories.clear()
    vend_model_serial.clear()
    
    uploaded_file.seek(0)
    reader = csv.reader(io.StringIO(uploaded_file.read().decode('utf-8-sig')))

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

    asset_tag_error, asset_tag_info = validate_asset_tags()
    if asset_tag_error:
        return False, f"Asset tag error: {asset_tag_info}"

    return True, "Correct formatting. "
