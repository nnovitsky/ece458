import csv
import io

from backend.import_export import field_validators
from backend.tables.models import Instrument

column_types = [
    'Vendor',
    'Model-Number',
    'Serial-Number',
    'Comment',
    'Calibration-Date',
    'Calibration-Comment',
]

sheet_instruments = []


def validate_row(current_row):

    if len(current_row) != len(column_types):
        return False, f"Row length mismatch. Expected {len(column_types)} " \
                      f"but received {len(current_row)} items."

    sheet_instruments.append(current_row[0] + " " + current_row[1] + " " + current_row[2])

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
            valid_cell, info = field_validators.is_valid_calibration_date(item)
        elif column_type == 'Calibration-Comment':
            valid_cell, info = field_validators.is_valid_comment(item)

        if not valid_cell:
            return False, info

    return True, "Valid Row"


def contains_duplicates():

    if len(sheet_instruments) != len(set(sheet_instruments)):
        return True, "Duplicate instruments contained within the imported sheet."

    db_instruments = Instrument.objects.all()
    for db_instrument in db_instruments:
        if str(db_instrument) in sheet_instruments:
            return True, f"Duplicate instrument ({db_instrument}) already exists in database"

    return False, "No Duplicates!"


def handler(uploaded_file):
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

    duplicate_error, duplicate_info = contains_duplicates()
    if duplicate_error:
        return False, f"Duplicate input: " + duplicate_info

    return True, "Correct formatting."
