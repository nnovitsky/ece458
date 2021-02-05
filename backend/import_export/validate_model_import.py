import csv

column_types = [
    'Vendor',
    'Model Number',
    'Short Description',
    'Comment',
    'Calibration Frequency',
]


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


    for item, column_type in zip(current_row, column_types):



    return True


def handler():

    with open('_Models_test1_pass.csv', 'r') as import_file:
        reader = csv.reader(import_file)
        headers = next(reader)

        has_valid_columns, header_log = validate_column_headers(headers)
        print(header_log)

        if has_valid_columns:
            for row in reader:
                validate_row(row)

