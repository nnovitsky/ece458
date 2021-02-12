import datetime

VENDOR_MAX_LENGTH = 30
MODEL_NUM_MAX_LENGTH = 40
DESC_MAX_LENGTH = 100
COMMENT_MAX_LENGTH = 2000
CALIBRATION_FREQUENCY_MAX_LENGTH = 10
SERIAL_NUM_MAX_LENGTH = 40
USERNAME_MAX_LENGTH = 50
EXPECTED_DATE_FORMAT = '%m/%d/%Y'


def validate_column_headers(headers, expected_headers):

    if len(headers) != len(expected_headers):
        return False, "Headers and expected headers quantity mismatch."

    for header, expected_header in zip(headers, expected_headers):
        if header != expected_header:
            return False, f"Mismatch between header (\'{header}\') " \
                          f"and expected header (\'{expected_header}\')"

    return True, "Validated Column headers."


def is_valid_vendor(vendor):

    if len(vendor) > VENDOR_MAX_LENGTH:
        return False, f"Vendor length too long." \
                      f"{len(vendor)} chars long, " \
                      f"Max: {VENDOR_MAX_LENGTH} chars"
    elif len(vendor) == 0:
        return False, "Missing vendor."

    return True, "Valid Vendor"


def is_valid_model_num(model_num):

    if len(model_num) > MODEL_NUM_MAX_LENGTH:
        return False, f"Model number length too long." \
                      f"{len(model_num)} chars long, " \
                      f"Max: {MODEL_NUM_MAX_LENGTH} chars"
    elif len(model_num) == 0:
        return False, "Missing model number."

    return True, "Valid Model Number"


def is_valid_description(desc):

    if len(desc) > DESC_MAX_LENGTH:
        return False, f"Description length too long." \
                      f"{len(desc)} chars long, " \
                      f"Max: {DESC_MAX_LENGTH} chars"
    elif len(desc) == 0:
        return False, "Missing description."

    return True, "Valid Description"


def is_valid_comment(comment):

    if len(comment) > COMMENT_MAX_LENGTH:
        return False, f"Comment length too long." \
                      f"{len(comment)} chars long, " \
                      f"Max: {COMMENT_MAX_LENGTH} chars"

    return True, "Valid Comment"


def is_valid_calibration_freq(calibration_freq):

    if calibration_freq == 'N/A':
        return True, "Valid calibration freq"

    if len(calibration_freq) > CALIBRATION_FREQUENCY_MAX_LENGTH:
        return False, f"Calibration freq length too long." \
                      f"{len(calibration_freq)} chars long, " \
                      f"Max: {CALIBRATION_FREQUENCY_MAX_LENGTH} chars"

    try:
        cal_freq_int = int(calibration_freq)
    except ValueError:
        return False, "Calibration frequency not an integer or \'N/A\'."

    if cal_freq_int <= 0:
        return False, "Calibration frequency must be a positive integer."

    return True, "Valid calibration freq"


def is_valid_serial_num(serial_num):
    if len(serial_num) > SERIAL_NUM_MAX_LENGTH:
        return False, f"Serial number length too long." \
                      f"{len(serial_num)} chars long, " \
                      f"Max: {SERIAL_NUM_MAX_LENGTH} chars"
    elif len(serial_num) == 0:
        return False, "Missing serial number."

    return True, "Valid Serial Number"


def is_valid_username(calibration_username):
    if len(calibration_username) > USERNAME_MAX_LENGTH:
        return False, f"Username length too long." \
                      f"{len(calibration_username)} chars long, " \
                      f"Max: {SERIAL_NUM_MAX_LENGTH} chars"
    elif len(calibration_username) == 0:
        return False, "Missing username for calibration event."

    return True, "Valid username"


def is_valid_calibration_date(calibration_date):
    if len(calibration_date) == 0:
        return False, "Missing calibration date."

    try:
        datetime.datetime.strptime(calibration_date, EXPECTED_DATE_FORMAT)
    except ValueError:
        return False, "Incorrect date format, should be MM/DD/YYYY."

    return True, "Correct date format."
