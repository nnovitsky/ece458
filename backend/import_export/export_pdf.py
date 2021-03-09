from io import BytesIO
from datetime import datetime, date
import pytz

from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import LETTER #8.5x11
from reportlab.lib import utils
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.platypus.tables import Table

from rest_framework import status
from rest_framework.response import Response
from django.http import FileResponse
from backend.tables.serializers import ListInstrumentReadSerializer
from backend.tables.models import LoadBankCalibration, LoadVoltage

EXPECTED_FIELDS = [
    'Vendor',
    'Model Number',
    'Model Description',
    'Serial Number',
    'Asset Tag',
    'Last Calibration',
    'Calibration Expiration',
    'Last calibrated by',
    'Calibration comment'
]

FILE_TYPE_INDEX = 0
FILE_NAME_INDEX = 1
styles = getSampleStyleSheet()


def get_fields(instrument):

    fields = []
    cal_file_data = []
    serializer = ListInstrumentReadSerializer(instrument)

    model_data = serializer.data['item_model']
    fields.append(model_data.get('vendor'))
    fields.append(model_data.get('model_number'))
    fields.append(model_data.get('description'))
    fields.append(str(instrument.serial_number))
    fields.append(str(instrument.asset_tag))

    cal_event = instrument.calibrationevent_set.order_by('-date')[:1][0]
    calibration_event_data = serializer.data['calibration_event'][0]
    fields.append(calibration_event_data.get('date'))
    fields.append(str(serializer.data['calibration_expiration']))
    fields.append(cal_event.user.username)
    fields.append(calibration_event_data.get('comment'))

    cal_file_data.append(calibration_event_data.get('file_type'))
    if cal_file_data[FILE_TYPE_INDEX] in ['Artifact', 'Load Bank']:
        cal_file_data.append(str(calibration_event_data.get('file'))[1:])

    return fields, cal_file_data, cal_event.pk


def get_image(path, width):
    img = utils.ImageReader(path)
    iw, ih = img.getSize()
    aspect_ratio = ih / float(iw)

    return Image(path, width=width, height=width*aspect_ratio)


def is_image_file(file_name):
    return file_name.split('.')[-1].lower() in ['jpg', 'png', 'gif']


def get_lb_metadata(lb_cal_event):

    test_voltage_model = LoadVoltage.objects.filter(lb_cal=lb_cal_event.pk)[0]

    voltmeter = lb_cal_event.voltmeter_vendor + " " + lb_cal_event.voltmeter_model_num + ", " + \
                f"({lb_cal_event.voltmeter_asset_tag})"
    shuntmeter = lb_cal_event.shunt_meter_vendor + " " + lb_cal_event.shunt_meter_model_num + ", " + \
                 f"({lb_cal_event.shunt_meter_asset_tag})"
    test_voltage = f"Tested: {test_voltage_model.test_voltage}V\n" + f"Reported: {test_voltage_model.vr}V\n" + \
                   f"Actual: {test_voltage_model.va}V"

    table_data = [
        ["Voltmeter", voltmeter],
        ["Shuntmeter", shuntmeter],
        ["Test Voltage", test_voltage]
    ]

    return Table(table_data, colWidths=270, rowHeights=79)


def get_lb_tables(cal_pk, elements):

    lb_header = '<font size="18">%s</font>' % "Load Bank Calibration:"
    elements.append(Paragraph(lb_header, styles["Heading2"]))

    lb_cal_event = LoadBankCalibration.objects.filter(cal_event = cal_pk)[0]
    elements.append(get_lb_metadata(lb_cal_event))

    return elements


def fill_pdf(buffer, fields, cal_file_data, cal_pk):
    doc = SimpleDocTemplate(buffer, pagesize=LETTER,
                            rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)

    elements = []
    tz_eastern = pytz.timezone('America/New_York')
    today_dt = datetime.now(tz_eastern)
    formatted_time = today_dt.strftime("%m/%d/%y %H:%M:%S")

    logo_path = "import_export/HPT_logo.png"
    elements.append(get_image(logo_path, 2*inch))

    styles.add(ParagraphStyle(name='Justify', alignment=TA_JUSTIFY))

    header_text = "Verification of Calibration"
    header = '<font size="18">%s</font>' % header_text
    elements.append(Paragraph(header, styles["Title"]))

    time_stamp = '<font size="12">%s</font>' % formatted_time
    elements.append(Paragraph(time_stamp, styles["Normal"]))
    elements.append(Spacer(1, 12))

    cal_event_fields = dict(zip(EXPECTED_FIELDS, fields))
    for line_key in cal_event_fields:
        line = line_key + ": " + cal_event_fields[line_key]
        text = '<font size="12">%s</font>' % line
        elements.append(Paragraph(text, styles["Normal"]))
        elements.append(Spacer(1, 10))

    if cal_file_data[FILE_TYPE_INDEX] == 'Artifact' and is_image_file(cal_file_data[FILE_NAME_INDEX]):
        elements.append(get_image(cal_file_data[FILE_NAME_INDEX], 4*inch))

    if cal_file_data[FILE_TYPE_INDEX] == 'Load Bank':
        # elements = get_lb_tables(cal_pk, elements)
        get_lb_tables(cal_pk, elements)

    doc.build(elements)
    return buffer


def handler(instrument):

    certificate_info, cal_file_data, cal_pk = get_fields(instrument)
    instrument_name = str(instrument).replace(" ", "_")
    filename = f"{instrument_name}_calibration_record_{date.today().strftime('%Y_%m_%d')}.pdf"
    buffer = fill_pdf(BytesIO(), certificate_info, cal_file_data, cal_pk)
    buffer.seek(0)
    try:
        return FileResponse(buffer, as_attachment=True, filename=filename)
    except IOError:
        return Response(status=status.HTTP_418_IM_A_TEAPOT)
