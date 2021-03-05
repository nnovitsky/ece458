import csv
import io

from backend.import_export import field_validators
from backend.tables.models import ItemModel, ItemModelCategory

column_types = [
    'Vendor',
    'Model-Number',
    'Short-Description',
    'Comment',
    'Model-Categories',
    'Load-Bank-Support',
    'Calibration-Frequency',
]

VENDOR_INDEX = 0
MODEL_NUM_INDEX = 1

sheet_models = []
sheet_categories = []


def validate_row(current_row):

    if len(current_row) != len(column_types):
        return False, f"Row length mismatch. Expected {len(column_types)} " \
                      f"but received {len(current_row)} items."

    if field_validators.is_blank_row(current_row):
        return True, "Blank row."

    sheet_models.append(current_row[VENDOR_INDEX] + " " + current_row[MODEL_NUM_INDEX])

    for item, column_type in zip(current_row, column_types):

        if column_type == 'Vendor':
            valid_cell, info = field_validators.is_valid_vendor(item)
        elif column_type == 'Model-Number':
            valid_cell, info = field_validators.is_valid_model_num(item)
        elif column_type == 'Short-Description':
            valid_cell, info = field_validators.is_valid_description(item)
        elif column_type == 'Comment':
            valid_cell, info = field_validators.is_valid_comment(item)
        elif column_type == 'Model-Categories':
            valid_cell, info = field_validators.is_valid_model_categories(item)

            if len(item.strip()) > 0:
                for category in item.split(' '):
                    sheet_categories.append(category)

        elif column_type == 'Load-Bank-Support':
            valid_cell, info = field_validators.is_valid_load_bank(item)
        elif column_type == 'Calibration-Frequency':
            valid_cell, info = field_validators.is_valid_calibration_freq(item)

        if not valid_cell:
            return False, info

    return True, "Valid Row"


def contains_duplicates():

    if len(sheet_models) != len(set(sheet_models)):
        return True, "Duplicate models contained within the imported sheet."

    db_models = ItemModel.objects.all()
    for db_model in db_models:
        if str(db_model) in sheet_models:
            return True, f"Duplicate model ({db_model}) already exists in database"

    return False, "No Duplicates!"


def validate_categories():

    db_categories = ItemModelCategory.objects.all()
    db_category_names = []

    for db_category in db_categories:
        db_category_names.append(db_category.name)

    for sheet_category in set(sheet_categories):
        if sheet_category not in db_category_names:
            return True, f"Model category \'{sheet_category}\' not in database."

    return False, "All models exist in database."


def handler(uploaded_file):
    sheet_models.clear()
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
            return False, f"row {row_number} malformed input: " + row_info

        row_number += 1

    duplicate_error, duplicate_info = contains_duplicates()

    if duplicate_error:
        return False, f"Duplicate input: " + duplicate_info

    print("Sheet categories: ", sheet_categories)
    category_error, category_info = validate_categories()

    if category_error:
        return False, category_info

    return True, "Correct formatting. "
