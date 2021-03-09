from io import BytesIO
from datetime import datetime, date
import pytz

from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import LETTER #8.5x11
from reportlab.lib import utils, colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.platypus.tables import Table, TableStyle

from rest_framework import status
from rest_framework.response import Response
from django.http import FileResponse
from backend.tables.serializers import ListInstrumentReadSerializer
from backend.tables.models import LoadBankCalibration, LoadVoltage, LoadCurrent

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
elements = []


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

    cal_comment = calibration_event_data.get('comment')
    if cal_comment.strip() == '':
        cal_comment = 'N/A'
    fields.append(cal_comment)

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

    t = Table(table_data, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('VALIGN', (0, 0), (0, 2), 'TOP'),
        ('BACKGROUND', (0, 0), (0, 2), colors.lightgrey)
    ]))

    elements.append(t)


def create_dummy_tables():
    global elements

    lb_header = '<font size="14">%s</font>' % "Load Bank Calibration:"
    elements.append(Paragraph(lb_header, styles["Heading2"]))
    dummy_meta_data = [
        ["Voltmeter", "Fluke 99V, (884723)"],
        ["Shuntmeter", "Fluke 1KA, (884724)"],
        ["Test Voltage", "Tested: 48.0V\nReported: 48.0V\nActual: 48.0V"]
    ]

    t = Table(dummy_meta_data, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('VALIGN', (0,0),(0,2), 'TOP'),
        ('BACKGROUND', (0,0),(0,2), colors.lightgrey)
    ]))

    elements.append(t)

    dummy_stage_data = [
        ['Load Level', 'Current Reported', 'Current Actual', 'Ideal Current', 'CR Error [%]', 'CR OK? [<3%]',
         'CA Error [%]', 'CA OK? [<5%]'],
        ['No load', '0', '0', '0', 'na', 'Yes', '0.0%', 'Yes'],
        ['1 x 100A', '100', '100', '100', 'na', 'Yes', '0.0%', 'Yes'],
        ['2 x 100A', '100', '100', '100', 'na', 'Yes', '0.0%', 'Yes'],
        ['3 x 100A', '100', '100', '100', 'na', 'Yes', '0.0%', 'Yes'],
        ['4 x 100A', '100', '100', '100', 'na', 'Yes', '0.0%', 'Yes'],
        ['5 x 100A', '100', '100', '100', 'na', 'Yes', '0.0%', 'Yes'],
        ['6 x 100A', '100', '100', '100', 'na', 'Yes', '0.0%', 'Yes'],
        ['7 x 100A', '100', '100', '100', 'na', 'Yes', '0.0%', 'Yes'],
        ['8 x 100A', '100', '100', '100', 'na', 'Yes', '0.0%', 'Yes'],
        ['9 x 100A', '100', '100', '100', 'na', 'Yes', '0.0%', 'Yes'],
        ['10 x 100A', '100', '100', '100', 'na', 'Yes', '0.0%', 'Yes']
    ]


    stage_one_header = '<font size="12">%s</font>' % "First Stage Results:"
    elements.append(Paragraph(stage_one_header, styles["Heading3"]))
    t_one = Table(dummy_stage_data)
    t_one.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,0), (7,0), colors.grey),
        ('TEXTCOLOR', (0, 0), (7, 0), colors.white),
        ('BACKGROUND', (5,1), (5,11), colors.lightgreen),
        ('BACKGROUND', (7,1), (7,11), colors.lightgreen)
    ]))
    elements.append(t_one)

    stage_two_header = '<font size="14">%s</font>' % "Second Stage Results:"
    elements.append(Paragraph(stage_two_header, styles["Heading3"]))
    elements.append(t_one)

    stage_three_header = '<font size="14">%s</font>' % "Third Stage Results:"
    elements.append(Paragraph(stage_three_header, styles["Heading3"]))
    elements.append(t_one)

    stage_four_header = '<font size="14">%s</font>' % "Fourth Stage Results:"
    elements.append(Paragraph(stage_four_header, styles["Heading3"]))
    elements.append(t_one)

    return elements


def get_stage_data(lc_data):
    cleaned_data = []
    for lc in lc_data:
        cleaned_data.append(
            [
                lc.load,
                str(lc.cr),
                str(lc.ca),
                str(lc.ideal),
                str(lc.cr_error),
                'Yes' if not lc.cr_ok else 'No',
                str(lc.ca_error),
                'Yes' if not lc.ca_ok else 'No',
            ]
        )


def get_lb_tables(cal_pk):

    lb_header = '<font size="14">%s</font>' % "Load Bank Calibration:"
    elements.append(Paragraph(lb_header, styles["Heading2"]))

    lb_cal_event = LoadBankCalibration.objects.filter(cal_event = cal_pk)[0]
    get_lb_metadata(lb_cal_event)

    ten_index_style = TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 0), (7, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (7, 0), colors.white),
        ('BACKGROUND', (5, 1), (5, 11), colors.lightgreen),
        ('BACKGROUND', (7, 1), (7, 11), colors.lightgreen)
    ])

    five_index_style = TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 0), (7, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (7, 0), colors.white),
        ('BACKGROUND', (5, 1), (5, 5), colors.lightgreen),
        ('BACKGROUND', (7, 1), (7, 5), colors.lightgreen)
    ])

    all_stages = LoadCurrent.objects.filter(lb_cal=lb_cal_event.pk)

    # STAGE 1
    stage_one_models = []
    for i in range(1, 12):
        stage_one_models.append(all_stages.filter(index=i)[0])

    stage_one_header = '<font size="12">%s</font>' % "First Stage Results:"
    elements.append(Paragraph(stage_one_header, styles["Heading3"]))
    t_one = Table(get_stage_data(stage_one_models))
    elements.append(t_one.setStyle(ten_index_style))

    # STAGE 2
    stage_two_models = []
    for i in range(12, 17):
        stage_two_models.append(all_stages.filter(index=i)[0])

    stage_two_header = '<font size="12">%s</font>' % "Second Stage Results:"
    elements.append(Paragraph(stage_two_header, styles["Heading3"]))
    t_two = Table(get_stage_data(stage_two_models))
    elements.append(t_two.setStyle(five_index_style))

    # STAGE 3
    stage_three_models = []
    for i in range(17, 27):
        stage_three_models.append(all_stages.filter(index=i)[0])
    stage_three_header = '<font size="12">%s</font>' % "Third Stage Results:"
    elements.append(Paragraph(stage_three_header, styles["Heading3"]))
    t_three = Table(get_stage_data(stage_three_models))
    elements.append(t_three.setStyle(ten_index_style))

    # STAGE 4
    stage_four_models = []
    for i in range(27, 37):
        stage_four_models.append(all_stages.filter(index=i)[0])
    stage_four_header = '<font size="12">%s</font>' % "Fourth Stage Results:"
    elements.append(Paragraph(stage_four_header, styles["Heading3"]))
    t_four = Table(get_stage_data(stage_four_models))
    elements.append(t_four.setStyle(ten_index_style))


def fill_pdf(buffer, fields, cal_file_data, cal_pk):
    global elements
    elements.clear()
    doc = SimpleDocTemplate(buffer, pagesize=LETTER,
                            rightMargin=72, leftMargin=72,
                            topMargin=15, bottomMargin=15)


    tz_eastern = pytz.timezone('America/New_York')
    today_dt = datetime.now(tz_eastern)
    formatted_time = today_dt.strftime("%m/%d/%y %H:%M:%S")

    logo_path = "import_export/HPT_logo.png"
    elements.append(get_image(logo_path, 2*inch))

    styles.add(ParagraphStyle(name='alignment', alignment=TA_JUSTIFY))

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

    #if cal_file_data[FILE_TYPE_INDEX] == 'Load Bank':
        #elements = get_lb_tables(cal_pk, elements)
        #get_lb_tables(cal_pk, elements)

    create_dummy_tables()
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
