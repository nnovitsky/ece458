from io import BytesIO
from datetime import datetime, date

from PyPDF2 import PdfFileMerger
from rest_framework import status
from rest_framework.response import Response
from django.http import FileResponse

from backend.import_export import export_pdf
from django.db.models import Q
from backend.config.admin_config import APPROVAL_STATUSES


def has_certificate(instrument):
    if instrument.item_model.calibration_frequency == 0:
        return False

    if len(instrument.calibrationevent_set.all()) == 0:
        return False

    no_approval_filter = Q(approval_status=APPROVAL_STATUSES['no_approval'])
    approved_filter = Q(approval_status=APPROVAL_STATUSES['approved'])

    if len(instrument.calibrationevent_set.filter(no_approval_filter | approved_filter)) == 0:
        return False

    return True


def chain_helper(cal_event):
    cal_events = []
    for instrument in cal_event.calibrated_by_instruments.all():
        if has_certificate(instrument):
            no_approval_filter = Q(approval_status=APPROVAL_STATUSES['no_approval'])
            approved_filter = Q(approval_status=APPROVAL_STATUSES['approved'])
            most_recent_cal = \
                instrument.calibrationevent_set.filter(no_approval_filter | approved_filter).order_by('-date', '-pk')[
                :1][0]
            cal_events.append(most_recent_cal)

    for certificate in cal_events:
        cal_events += chain_helper(certificate)

    return cal_events


def get_chain(instrument):
    no_approval_filter = Q(approval_status=APPROVAL_STATUSES['no_approval'])
    approved_filter = Q(approval_status=APPROVAL_STATUSES['approved'])
    cal_event = \
        instrument.calibrationevent_set.filter(no_approval_filter | approved_filter).order_by('-date', '-pk')[:1][0]

    chain = [cal_event]
    chain += chain_helper(cal_event)
    return chain


def merge_pdfs(buffers):

    merger = PdfFileMerger()
    merged_buffer = BytesIO()

    for buffer in buffers:
        merger.append(buffer)

    merger.write(merged_buffer)
    merger.close()
    return merged_buffer


def get_buffer(instrument):
    certificate_info, cal_file_data, cal_pk = export_pdf.get_fields(instrument)
    buffer, pdf_merge = export_pdf.fill_pdf(BytesIO(), certificate_info, cal_file_data, cal_pk)
    buffer.seek(0)

    if pdf_merge:
        pdf_buffer = export_pdf.merge_pdf(cal_pk, buffer)
        pdf_buffer.seek(0)
    else:
        pdf_buffer = buffer

    return pdf_buffer


def handler(instrument):

    filename = f"{str(instrument)}_chain_calibration_record_{date.today().strftime('%Y_%m_%d')}.pdf"
    certificate_chain = get_chain(instrument)

    buffers = []
    for certificate in certificate_chain:
        buffers.append(get_buffer(certificate.instrument))

    chain_pdf = merge_pdfs(buffers)
    chain_pdf.seek(0)

    return FileResponse(chain_pdf, as_attachment=True, filename=filename)
