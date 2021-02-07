import sys
import csv
import logging

from backend.import_export import field_validators

column_types = [
    'Vendor',
    'Model Number',
    'Serial Number',
    'Comment',
]

TEST_CSV = 'sample_CSVs/_Instruments_test3_fail.csv'


def validate_column_headers(headers):
    expected_headers = column_types

    if len(headers) != len(expected_headers):
        return False, "Headers and expected headers quantity mismatch."

    for header, expected_header in zip(headers, expected_headers):
        if header != expected_header:
            return False, f"Mismatch between header (\'{header}\') " \
                          f"and expected header (\'{expected_header}\')"

    return True, "Validated Column headers."


def validate_row(current_row):

    if len(current_row) != len(column_types):
        return False, f"Row length mismatch. Expected {len(column_types)} " \
                      f"but received {len(current_row)} items."

    for item, column_type in zip(current_row, column_types):

        if column_type == 'Vendor':
            valid_cell, info = field_validators.is_valid_vendor(item)
        elif column_type == 'Model Number':
            valid_cell, info = field_validators.is_valid_model_num(item)
        elif column_type == 'Serial Number':
            valid_cell, info = field_validators.is_valid_serial_num(item)
        elif column_type == 'Comment':
            valid_cell, info = field_validators.is_valid_comment(item)

        if not valid_cell:
            return False, info

    return True, "Valid Row"


def main():
    with open(TEST_CSV, 'r') as import_file:
        reader = csv.reader(import_file)
        headers = next(reader)

        has_valid_columns, header_log = validate_column_headers(headers)

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
