import datetime

VENDOR_MAX_LENGTH = 30
MODEL_NUM_MAX_LENGTH = 40
DESC_MAX_LENGTH = 100
COMMENT_MAX_LENGTH = 2000
CALIBRATION_FREQUENCY_MAX_LENGTH = 10
SERIAL_NUM_MAX_LENGTH = 40
USERNAME_MAX_LENGTH = 50
CALIBRATION_DATE_MAX_LENGTH = 20
CALIBRATION_APPROVAL_MAX_LENGTH = 1

MODEL_CATEGORIES_MAX_LENGTH = 100
INSTRUMENT_CATEGORIES_MAX_LENGTH = 100


ASSET_TAG_LENGTH = 6
ASSET_TAG_MAX_VALUE = 999999

EXPECTED_DATE_FORMAT = '%m/%d/%Y'

VALID_CAL_TYPES = [
    '',
    'Load-Bank',
    'Klufe'
]


def validate_column_headers(headers, expected_headers):

    if len(headers) < len(expected_headers):
        return False, "Missing headers in file."
    elif len(headers) > len(expected_headers):
        headers = headers[0:len(expected_headers)-1]

    for header, expected_header in zip(headers, expected_headers):
        if header != expected_header:
            return False, f"Mismatch between header (\'{header}\') " \
                          f"and expected header (\'{expected_header}\')"

    return True, "Validated Column headers."


def is_valid_vendor(vendor):

    if len(vendor) > VENDOR_MAX_LENGTH:
        return False, f"Vendor length too long. " \
                      f"{len(vendor)} chars long, " \
                      f"Max: {VENDOR_MAX_LENGTH} chars"
    elif len(vendor) == 0:
        return False, "Missing vendor."

    return True, "Valid Vendor"


def is_valid_model_num(model_num):

    if len(model_num) > MODEL_NUM_MAX_LENGTH:
        return False, f"Model number length too long. " \
                      f"{len(model_num)} chars long, " \
                      f"Max: {MODEL_NUM_MAX_LENGTH} chars"
    elif len(model_num) == 0:
        return False, "Missing model number."

    return True, "Valid Model Number"


def is_valid_description(desc):

    if len(desc) > DESC_MAX_LENGTH:
        return False, f"Description length too long. " \
                      f"{len(desc)} chars long, " \
                      f"Max: {DESC_MAX_LENGTH} chars"
    elif len(desc) == 0:
        return False, "Missing description."

    return True, "Valid Description"


def is_valid_comment(comment):

    if len(comment) > COMMENT_MAX_LENGTH:
        return False, f"Comment length too long. " \
                      f"{len(comment)} chars long, " \
                      f"Max: {COMMENT_MAX_LENGTH} chars"

    return True, "Valid Comment"


def is_valid_calibration_freq(calibration_freq):

    if calibration_freq == 'N/A':
        return True, "Valid calibration freq"

    if len(calibration_freq) > CALIBRATION_FREQUENCY_MAX_LENGTH:
        return False, f"Calibration freq length too long. " \
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
        return False, f"Serial number length too long. " \
                      f"{len(serial_num)} chars long, " \
                      f"Max: {SERIAL_NUM_MAX_LENGTH} chars"

    return True, "Valid Serial Number"


def is_valid_username(calibration_username):
    if len(calibration_username) > USERNAME_MAX_LENGTH:
        return False, f"Username length too long. " \
                      f"{len(calibration_username)} chars long, " \
                      f"Max: {SERIAL_NUM_MAX_LENGTH} chars"
    elif len(calibration_username) == 0:
        return False, "Missing username for calibration event."

    return True, "Valid username"


def is_valid_calibration_date(calibration_date, calibratable_instrument):
    if len(calibration_date) > 0 and not calibratable_instrument:
        return False, "Received calibration date for non-calibratable instrument"

    if len(calibration_date) == 0 and calibratable_instrument:
        return False, "Needs to be calibrated"
    elif len(calibration_date) == 0 and not calibratable_instrument:
        return True, "Correct formatting for non-calibratable instrument"

    # Not sure why this is a requirement if must follow MM-DD-YYYY format?
    # Including anyways for now.
    if len(calibration_date) > CALIBRATION_DATE_MAX_LENGTH:
        return False, f"Calibration date \'{calibration_date}\' too long, " \
                      f"Max: {CALIBRATION_DATE_MAX_LENGTH} chars long"

    try:
        datetime.datetime.strptime(calibration_date, EXPECTED_DATE_FORMAT)
    except ValueError:
        return False, "Incorrect date format, should be MM/DD/YYYY."

    return True, "Correct date format."


def is_valid_model_categories(model_categories):

    if len(model_categories) > MODEL_CATEGORIES_MAX_LENGTH:
        return False, f"Model categories entry \'{model_categories}\' too long, " \
                      f"Max: {MODEL_CATEGORIES_MAX_LENGTH} chars long"

    return True, "Valid set of model categories."


def is_valid_cal_type(cal_type_field):

    stripped_field = cal_type_field.strip()

    if stripped_field in VALID_CAL_TYPES:
        return True, "Valid load-bank-support entry"

    return False, f"\'{cal_type_field}\' is not a valid load-bank-support entry. " \
                  f"Must be one of the following {len(VALID_CAL_TYPES)} possibilities: {VALID_CAL_TYPES}."


def is_blank_row(row):

    for item in row:
        if item != '':
            return False

    return True


def is_valid_asset_tag(asset_tag):
    if len(asset_tag.strip()) == 0:
        return True, "Default asset tag."

    if len(asset_tag) == ASSET_TAG_LENGTH and asset_tag.isdigit():
        return True, "Valid asset tag format."

    return False, "Invalid asset tag"


def is_valid_instrument_categories(instrument_categories):

    if len(instrument_categories) > INSTRUMENT_CATEGORIES_MAX_LENGTH:
        return False, f"Instrument categories entry \'{instrument_categories}\' too long, " \
                      f"Max: {INSTRUMENT_CATEGORIES_MAX_LENGTH} chars long"

    return True, "Valid set of instrument categories."


def is_valid_approval_column(approval_field):
    if len(approval_field) > CALIBRATION_APPROVAL_MAX_LENGTH:
        return False, "Field must be 1 or 0 character(s) long."