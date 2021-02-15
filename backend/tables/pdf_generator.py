import os
from io import BytesIO

from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.pagesizes import LETTER #8.5x11
from rest_framework import status
from rest_framework.response import Response
from django.http import FileResponse
from backend.tables.serializers import ListInstrumentReadSerializer

from backend.tables.models import ItemModel, Instrument, CalibrationEvent

EXPECTED_FIELDS = [
    'Vendor',
    'Model Number',
    'Model Description',
    'Serial Number',
    'Last Calibration',
    'Calibration Expiration',
    'Last calibrated by',
    'Calibration comment'
]


X_CENTER = LETTER[0] / 2
Y_CENTER = LETTER[1] / 2
HEADER_X_OFFSET = 125
HEADER_Y_OFFSET = LETTER[1] - 60
BODY_X_OFFSET = 40
BODY_Y_OFFSET = LETTER[1] - 100
NEW_LINE = 35
HEADER_TEXT = "HPT Calibration Certificate"

def get_fields(instrument):
    sample_fields = [
        'Duracell',
        'AAA',
        'Rechargable AAA battery set',
        '99999999',
        '2021-01-01',
        '2021-12-31',
        'jwood',
        'Battery charger taking time. May need to replace soon.'
    ]

    fields = []
    serializer = ListInstrumentReadSerializer(instrument)


    model_data = serializer.data['item_model']
    fields.append(model_data.get('vendor'))
    fields.append(model_data.get('model_number'))
    fields.append(model_data.get('description'))
    fields.append(str(model_data.get('serial_number')))

    calibration_event_data = serializer.data['calibration_event'][0]
    fields.append(calibration_event_data.get('date'))
    fields.append(str(serializer.data['calibration_expiration']))
    fields.append(str(calibration_event_data.get('user'))) #Returns the user's PK???
    fields.append(calibration_event_data.get('comment'))

    return fields


#TODO: handle longer text as a second line (e.g. long comments)
def populate_pdf(buffer, fields):
    #HEADER
    pdf = Canvas(buffer, pagesize=LETTER)
    pdf.setFont("Times-Roman",24)
    pdf.drawString(X_CENTER - HEADER_X_OFFSET,
                   HEADER_Y_OFFSET, HEADER_TEXT)
    #BODY
    pdf.setFont("Times-Roman",14)
    for i in range(len(EXPECTED_FIELDS)):
        next_line = "".join((EXPECTED_FIELDS[i], ': ', fields[i]))
        pdf.drawString(BODY_X_OFFSET, BODY_Y_OFFSET - i*NEW_LINE,
                       next_line)

    pdf.showPage()
    pdf.save()

    return buffer

def handler(instrument):

    certificate_info = get_fields(instrument)
    buffer = populate_pdf(BytesIO(), certificate_info)
    buffer.seek(0)
    try:
        return FileResponse(buffer, as_attachment=True, filename='hello.pdf')
    except IOError:
        Response(status=status.HTTP_418_IM_A_TEAPOT)


