import datetime

from rest_framework.response import Response
from rest_framework import status

from backend.tables.models import ItemModel, Instrument, ItemModelCategory


def check_instrument_cal_status(calibrator_pk):

    instrument = Instrument.objects.get(pk=calibrator_pk)
    cal_frequency = instrument.item_model.calibration_frequency

    if cal_frequency < 1:
        return True
    cal_set = instrument.calibrationevent_set.order_by('-date')
    if len(cal_set) > 0:
        for cal in cal_set:
            approved = (cal.approval_status == 'NA') or (cal.approval_status == 'Approved')
            exp_date = cal.date + datetime.timedelta(cal_frequency)
            if exp_date >= datetime.date.today() and approved:
                return True

    return False


def check_categories(calibrator_pk, valid_cats):
    cal_item_model_pk = Instrument.objects.get(pk=calibrator_pk).item_model.pk
    cal_item_model_cats = ItemModelCategory.objects.all().filter(item_models=cal_item_model_pk)
    valid_calibrator = False
    for valid_cal_cat in valid_cats:
        if valid_cal_cat in cal_item_model_cats: valid_calibrator = True

    return valid_calibrator


def validate_helper(calibrator_model_pk, instruments):
    valid_cats = ItemModelCategory.objects.all().filter(calibrated_with=calibrator_model_pk)

    for instrument in instruments:
        instrument_name = str(Instrument.objects.get(pk=instrument))

        yes_valid_categories = check_categories(instrument, valid_cats)
        if not yes_valid_categories:
            return False, f"Calibrator instrument {instrument_name} does not belong to a valid category for " \
                          f"calibration use."

        yes_valid_instruments = check_instrument_cal_status(instrument)
        if not yes_valid_instruments:
            return False, f"Calibrator instrument {instrument_name} is out of calibration."

    return True, ""


def handler(errors, valid_cats, instruments, pks):
    item_model_pk = pks[0]
    instrument_pk = pks[1]

    for calibrator_pk in instruments:
        valid_calibrator = check_categories(calibrator_pk, valid_cats)
        if not valid_calibrator:
            errors.append(f"Calibration instrument {Instrument.objects.get(pk=calibrator_pk)} is not a valid"
                          f" calibrator for the instrument under calibration.")

        instrument_in_cal = check_instrument_cal_status(calibrator_pk)
        if not instrument_in_cal:
            errors.append(f"Calibration instrument {Instrument.objects.get(pk=calibrator_pk)} is out of calibration.")

    if len(errors) != 0:
        return Response({"is_valid": False, "calibration_errors": errors},
                        status=status.HTTP_200_OK)

    return Response({"is_valid": True,
                     "calibrated_by_instruments": instruments,
                     "instrument_name": str(ItemModel.objects.get(pk=item_model_pk))
                     },
                     status=status.HTTP_200_OK)
