#Vendor
#Model Number
#Short Description
#Comment
#Calibration Frequency
VENDOR_MAX_LENGTH = 30
MODEL_NUM_MAX_LENGTH = 40
DESC_MAX_LENGTH = 100
COMMENT_MAX_LENGTH = 200
CALIBRATION_FREQUENCY_MAX_LENGTH = 10


def is_valid_vendor(vendor):

    if len(vendor) > VENDOR_MAX_LENGTH:
        return False, f"Vendor length too long." \
                      f"{len(vendor)} chars long, " \
                      f"Max: {VENDOR_MAX_LENGTH} chars"
    elif len(vendor) == 0:
        return False, "Missing vendor."

    return True, "Valid Vendor"


def is_valid_model_number(model_number):

    if len(model_number) > MODEL_NUM_MAX_LENGTH:
        return False, f"Model number length too long." \
                      f"{len(model_number)} chars long, " \
                      f"Max: {MODEL_NUM_MAX_LENGTH} chars"
    elif len(model_number) == 0:
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

    if len(calibration_freq) > CALIBRATION_FREQUENCY_MAX_LENGTH:
        return False, f"Calibration freq length too long." \
                      f"{len(calibration_freq)} chars long, " \
                      f"Max: {CALIBRATION_FREQUENCY_MAX_LENGTH} chars"

    return True, "Valid calibration freq"