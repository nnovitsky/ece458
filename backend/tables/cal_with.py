from rest_framework.response import Response
from rest_framework import status

from backend.tables.models import ItemModel, Instrument, ItemModelCategory

def check_instrument(calibrator_pk):


    return True


def check_categories(calibrator_pk, valid_cats):
    cal_item_model_pk = Instrument.objects.get(pk=calibrator_pk).item_model.pk
    cal_item_model_cats = ItemModelCategory.objects.all().filter(item_models=cal_item_model_pk)
    valid_calibrator = False
    for valid_cal_cat in valid_cats:
        if valid_cal_cat in cal_item_model_cats: valid_calibrator = True

    return valid_calibrator


def handler(errors, valid_cats, instruments, pks):
    item_model_pk = pks[0]
    instrument_pk = pks[1]

    for calibrator_pk in instruments:
        valid_calibrator = check_categories(calibrator_pk, valid_cats)
        if not valid_calibrator:
            errors.append(f"Calibration instrument {Instrument.objects.get(pk=calibrator_pk)} is not a valid"
                          f" calibrator for the instrument under calibration.")

        valid_instrument = check_instrument(calibrator_pk)
        if not valid_instrument:
            errors.append(f"Calibration instrument {Instrument.objects.get(pk=calibrator_pk)} is out of calibration.")

    if len(errors) != 0:
        return Response({"is_valid": False, "calibration_errors": errors},
                        status=status.HTTP_400_BAD_REQUEST)

    return Response({"is_valid": True,
                     "instrument_pk": instrument_pk,
                     "instrument_name": str(ItemModel.objects.get(pk=item_model_pk))
                     },
                     status=status.HTTP_200_OK)