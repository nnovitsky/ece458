import datetime

from rest_framework.response import Response
from rest_framework import status

from backend.tables.models import ItemModel, Instrument, ItemModelCategory
from backend.tables.graph import Graph
from backend.config.admin_config import APPROVAL_STATUSES


valid_status = [
    APPROVAL_STATUSES['approved'],
    APPROVAL_STATUSES['pending'],
    APPROVAL_STATUSES['no_approval']
]


def check_instrument_cal_status(calibrator_pk):

    instrument = Instrument.objects.get(pk=calibrator_pk)
    cal_frequency = instrument.item_model.calibration_frequency

    if cal_frequency < 1:
        return False
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


def get_calibrator_pks(instrument_pk):
    instrument = Instrument.objects.get(pk=instrument_pk)
    cal_events = instrument.calibrationevent_set.order_by('-date', '-pk')[:1]
    if cal_events.count() == 0:
        return []
    elif cal_events.count() == 1 and cal_events[0].approval_status == APPROVAL_STATUSES['rejected']:
        return []
    elif cal_events.count() == 1:
        if cal_events[0].calibrated_by_instruments.all().count() == 0:
            return []
        else:
            return list(cal_events[0].calibrated_by_instruments.values_list('pk', flat=True).all())
    # else:
    #     for cal_event in cal_events.all():
    #         if cal_event.approval_status in valid_status:
    #             return list(cal_event.calibrated_by_instruments.all())

    return []


def validate_helper(calibrator_model_pk, instruments, instrument_pk):
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

    cycle_exists = check_for_cycle(instrument_pk, instruments)
    if cycle_exists:
        return False, "Calibration creates circular dependency."

    return True, ""


def check_for_cycle_helper(instrument_pk, edges, unique_nodes):
    if instrument_pk not in unique_nodes:
        unique_nodes.append(instrument_pk)

    calibrator_pks = get_calibrator_pks(instrument_pk)
    if len(calibrator_pks) > 0:
        for pk in calibrator_pks:
            if [instrument_pk, pk] in edges:
                # edges.append([instrument_pk, pk])
                return edges, unique_nodes

            edges.append([instrument_pk, pk])
            edges, unique_nodes = check_for_cycle_helper(pk, edges, unique_nodes)

    return edges, unique_nodes


# def check_for_cycle(instrument_pk, calibrator_pks):
#     if instrument_pk in calibrator_pks:
#         return True
#
#     edges = []
#     unique_nodes = [instrument_pk]
#
#     for pk in calibrator_pks:
#         edges.append([instrument_pk, pk])
#         edges, unique_nodes = check_for_cycle_helper(pk, edges, unique_nodes)
#
#
#     graph = Graph(len(unique_nodes))
#     for edge in edges:
#         if edge[0] == edge[1]:
#             return True
#
#         graph.add_edge(edge[0], edge[1])
#
#     print(edges)
#     return graph.is_cyclic()

def get_children(instrument_pk):
    children = set()
    ins = Instrument.objects.get(pk=instrument_pk)
    cal_events = ins.calibrationevent_set.order_by('-date', '-pk')
    for cal_event in cal_events:
        if cal_event.approval_status == APPROVAL_STATUSES['pending']:
            children.update({obj.pk for obj in cal_event.calibrated_by_instruments.all()})
        elif cal_event.approval_status == APPROVAL_STATUSES['no_approval'] or cal_event.approval_status == APPROVAL_STATUSES['approved']:
            children.update({obj.pk for obj in list(cal_event.calibrated_by_instruments.all())})
            break
    return children

def check_for_cycle(instrument_pk, calibrator_pks):
    if instrument_pk in calibrator_pks:
        return True
    seen = []
    queue = set(calibrator_pks)
    while len(queue) != 0:
        next = queue.pop()
        if next not in seen:
            seen.append(next)
            children = get_children(next)
            if instrument_pk in children:
                return True
            queue.update(children)
    return False


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

    cycle_exists = check_for_cycle(instrument_pk, instruments)
    if cycle_exists:
        errors.append("Calibration creates circular dependency.")

    if len(errors) != 0:
        return Response({"is_valid": False, "calibration_errors": errors},
                        status=status.HTTP_200_OK)

    ins = Instrument.objects.get(pk=calibrator_pk)
    return Response({"is_valid": True,
                     "calibrated_by_instruments": instruments,
                     "instrument_name": f"{str(ins.item_model)}"
                     },
                     status=status.HTTP_200_OK)
