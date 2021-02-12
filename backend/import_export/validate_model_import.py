import sys
import csv
import logging

from backend.import_export import field_validators

column_types = [
    'Vendor',
    'Model-Number',
    'Short-Description',
    'Comment',
    'Calibration-Frequency',
]

TEST_CSV = 'sample_CSVs/_Models_test1_pass.csv'


def validate_row(current_row):

    if len(current_row) != len(column_types):
        return False, f"Row length mismatch. Expected {len(column_types)} " \
                      f"but received {len(current_row)} items."

    for item, column_type in zip(current_row, column_types):

        if column_type == 'Vendor':
            valid_cell, info = field_validators.is_valid_vendor(item)
        elif column_type == 'Model-Number':
            valid_cell, info = field_validators.is_valid_model_num(item)
        elif column_type == 'Short-Description':
            valid_cell, info = field_validators.is_valid_description(item)
        elif column_type == 'Comment':
            valid_cell, info = field_validators.is_valid_comment(item)
        elif column_type == 'Calibration-Frequency':
            valid_cell, info = field_validators.is_valid_calibration_freq(item)

        if not valid_cell:
            return False, info

    return True, "Valid Row"


def check_duplicates(current_row):

    return True, "No Duplicates!"


def main():
    with open(TEST_CSV, 'r') as import_file:
        reader = csv.reader(import_file)
        headers = next(reader)

        has_valid_columns, header_log = \
            field_validators.validate_column_headers(headers, column_types)

        if not has_valid_columns:
            logging.error(header_log)

        row_number = 1
        if has_valid_columns:
            for row in reader:
                valid_row, row_info = validate_row(row)
                if not valid_row:
                    logging.error(f"Row {row_number}: {row_info}")
                    sys.exit()

                row_number += 1
            logging.info(f"Successfully parsed {row_number} rows.")


        sys.exit()


if __name__ == '__main__':
    logging.basicConfig(filename='import.log', level=logging.INFO)
    main()
