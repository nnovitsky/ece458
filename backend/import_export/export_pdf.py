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
from PyPDF2 import PdfFileMerger

from rest_framework import status
from rest_framework.response import Response
from django.http import FileResponse
from django.db.models import Q
from backend.config.admin_config import APPROVAL_STATUSES
from backend.config.klufe_config import VOLTAGE_LEVELS
from backend.config.form_config import FORM_FIELDS
from backend.tables.serializers import ListInstrumentReadSerializer
from backend.tables.models import CalibrationEvent, LoadBankCalibration, LoadVoltage, LoadCurrent, KlufeCalibration, \
                                  KlufeVoltageReading, CalibrationFormField, CalibrationApproval, Instrument, \
                                  ItemModelCategory

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

lb_stage_headers = [
    'Load Level',
    'Current Reported',
    'Current Actual',
    'Ideal Current',
    'CR Error [%]',
    'CR OK? [<3%]',
    'CA Error [%]', 'CA OK? [<5%]'
]

klufe_cal_headers = [
    'Test',
    'Source Voltage',
    'Frequency',
    'Target Range',
    'Reported Voltage',
    'Voltage OK?'
]

custom_form_headers = [
    'Order Inputted',
    'Type of Input',
    'Prompt',
    'Entry',
    'Expected Input'
]

approval_headers = [
    'Date',
    'User',
    'Comment'
]
#
# cal_with_headers = [
#     'Vendor & Model Num.',
#     'Asset Tag',
#     'Relevant Categories'
# ]

cal_with_headers = [
    'Vendor & Model Num.',
    'Asset Tag'
]


FILE_TYPE_INDEX = 0
FILE_NAME_INDEX = 1
styles = getSampleStyleSheet()
styleN = styles["BodyText"]
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

    no_approval_filter = Q(approval_status=APPROVAL_STATUSES['no_approval'])
    approved_filter = Q(approval_status=APPROVAL_STATUSES['approved'])
    cal_event = instrument.calibrationevent_set.filter(no_approval_filter | approved_filter).order_by('-date', '-pk')[:1][0]
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
    return file_name.split('.')[-1].lower() in ['jpg', 'jpeg', 'png', 'gif']


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


def get_stage_data(lc_data):
    cleaned_data = [lb_stage_headers]
    for lc in lc_data:

        if lc.cr_error is not None:
            cr_error = f"{lc.cr_error:.2f}%"
        else:
            cr_error = "N/A"

        if lc.ca_error is not None:
            ca_error = f"{lc.ca_error:.2f}%"
        else:
            ca_error = "N/A"


        cleaned_data.append(
            [
                lc.load,
                f"{int(lc.cr)}",
                f"{int(lc.ca)}",
                f"{int(lc.ideal)}",
                cr_error,
                'Yes',
                ca_error,
                'Yes',
            ]
        )
    return cleaned_data


def get_lb_tables(cal_pk):
    global elements

    lb_header = '<font size="14">%s</font>' % "Load Bank Calibration:"
    elements.append(Paragraph(lb_header, styles["Heading2"]))

    lb_cal_event = LoadBankCalibration.objects.filter(cal_event=cal_pk)[0]
    get_lb_metadata(lb_cal_event)
    all_stages = LoadCurrent.objects.filter(lb_cal=lb_cal_event.pk)

    # STAGE 1
    stage_one_models = []
    for i in range(1, 12):
        stage_one_models.append(all_stages.filter(index=i)[0])

    stage_one_header = '<font size="12">%s</font>' % "First Stage Results:"
    elements.append(Paragraph(stage_one_header, styles["Heading3"]))

    t_one = Table(get_stage_data(stage_one_models))
    t_one.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 0), (7, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (7, 0), colors.white),
        ('BACKGROUND', (5, 1), (5, 11), colors.lightgreen),
        ('BACKGROUND', (7, 1), (7, 11), colors.lightgreen),
        ('FONTSIZE', (0, 0), (-1, -1), 8)
    ]))
    elements.append(t_one)

    # STAGE 2
    stage_two_models = []
    for i in range(12, 17):
        stage_two_models.append(all_stages.filter(index=i)[0])

    stage_two_header = '<font size="12">%s</font>' % "Second Stage Results:"
    elements.append(Paragraph(stage_two_header, styles["Heading3"]))
    t_two = Table(get_stage_data(stage_two_models))
    t_two.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 0), (7, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (7, 0), colors.white),
        ('BACKGROUND', (5, 1), (5, 5), colors.lightgreen),
        ('BACKGROUND', (7, 1), (7, 5), colors.lightgreen),
        ('FONTSIZE', (0, 0), (-1, -1), 8)
    ]))
    elements.append(t_two)

    # STAGE 3
    stage_three_models = []
    for i in range(17, 27):
        stage_three_models.append(all_stages.filter(index=i)[0])
    stage_three_header = '<font size="12">%s</font>' % "Third Stage Results:"
    elements.append(Paragraph(stage_three_header, styles["Heading3"]))
    t_three = Table(get_stage_data(stage_three_models))
    t_three.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 0), (7, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (7, 0), colors.white),
        ('BACKGROUND', (5, 1), (5, 11), colors.lightgreen),
        ('BACKGROUND', (7, 1), (7, 11), colors.lightgreen),
        ('FONTSIZE', (0, 0), (-1, -1), 8)
    ]))
    elements.append(t_three)

    # STAGE 4
    stage_four_models = []
    for i in range(27, 37):
        stage_four_models.append(all_stages.filter(index=i)[0])
    stage_four_header = '<font size="12">%s</font>' % "Fourth Stage Results:"
    elements.append(Paragraph(stage_four_header, styles["Heading3"]))
    t_four = Table(get_stage_data(stage_four_models))
    t_four.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 0), (7, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (7, 0), colors.white),
        ('BACKGROUND', (5, 1), (5, 11), colors.lightgreen),
        ('BACKGROUND', (7, 1), (7, 11), colors.lightgreen),
        ('FONTSIZE', (0, 0), (-1, -1), 8)
    ]))
    elements.append(t_four)


def get_xlsx_hyperlink(cal_pk):
    prod_link = f"https://hptmanager.colab.duke.edu/api/cal_download/{int(cal_pk)}/"
    local_link = f"http://localhost:8000/api/cal_download/{int(cal_pk)}/"
    address = '<link href="' + prod_link + '">' + 'Supplemental File' + '</link>'
    elements.append(Paragraph(address, styles["Heading3"]))


def get_klufe_data(klufe_tests):
    cleaned_data = [klufe_cal_headers]
    for test in klufe_tests:
        test_num = str(test.index + 1)

        source_voltage = f"{test.source_voltage}V"
        if test.source_hertz is not None:
            source_voltage += " AC"
            if test.source_hertz > 1000:
                frequency = f"{int(test.source_hertz/1000)} kHz"
            else:
                frequency = f"{int(test.source_hertz)} Hz"
        else:
            source_voltage += " DC"
            frequency = "NA"

        target_range = VOLTAGE_LEVELS[test.index]['description']
        reported_voltage = f"{test.reported_voltage}V"
        voltage_okay = "Yes" if test.voltage_okay else "No"

        cleaned_data.append([
            test_num,
            source_voltage,
            frequency,
            target_range,
            reported_voltage,
            voltage_okay
        ])

    return cleaned_data


def get_klufe_table(cal_pk):
    global elements

    klufe_header = '<font size="14">%s</font>' % "Guided Klufe k5700 Calibration Results:"
    elements.append(Paragraph(klufe_header, styles["Heading2"]))

    klufe_cal_event = KlufeCalibration.objects.filter(cal_event=cal_pk)[0]
    klufe_tests_qs = KlufeVoltageReading.objects.filter(klufe_cal=klufe_cal_event.pk)

    klufe_tests = []
    for i in range(len(VOLTAGE_LEVELS)):
        klufe_tests.append(klufe_tests_qs.filter(index=i)[0])

    klufe_table = Table(get_klufe_data(klufe_tests))
    klufe_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 0), (5, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (5, 0), colors.white),
        ('BACKGROUND', (5, 1), (5, 5), colors.lightgreen),
        ('FONTSIZE', (0, 0), (-1, -1), 10)
    ]))

    elements.append(klufe_table)


def get_custom_form_data(cal_pk):
    cleaned_data = [custom_form_headers]
    form_tests = CalibrationFormField.objects.filter(cal_event=cal_pk)

    for index in range(form_tests.count()):
        form_test = form_tests.filter(index=index+1)[0]
        field_type = str(form_test.fieldtype)

        if field_type == FORM_FIELDS['text_input']:
            reported_value = form_test.actual_string
            expected_value = form_test.expected_string
        elif field_type == FORM_FIELDS['float_input']:
            reported_value = form_test.actual_float
            yes_min = form_test.expected_min is not None
            yes_max = form_test.expected_max is not None
            if yes_min and yes_max:
                expected_value = f"Min: {form_test.expected_min}\nMax: {form_test.expected_max}"
            elif yes_max and not yes_min:
                expected_value = f"Max: {form_test.expected_max}"
            elif yes_min and not yes_max:
                expected_value = f"Min: {form_test.expected_min}"
            else:
                expected_value = "NA"

        elif field_type == FORM_FIELDS['bool_input']:
            reported_value = form_test.actual_bool
            expected_value = "True"
        else:
            reported_value = ""

        label = Paragraph(str(form_test.label), styleN)
        # entry = Paragraph(str(reported_value), styleN)


        cleaned_data.append([
            str(index+1),
            field_type,
            label,
            str(reported_value),
            expected_value
        ])

    return cleaned_data


def get_custom_table(cal_pk):
    global elements

    form_header = '<font size="14">%s</font>' % "Custom Form Calibration Results:"
    elements.append(Paragraph(form_header, styles["Heading2"]))

    form_data = get_custom_form_data(cal_pk)
    form_table = Table(form_data)
    form_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,0), (4,0), colors.grey),
        ('TEXTCOLOR', (0, 0), (4,0), colors.white),
        ('BACKGROUND', (3, 1), (3, len(form_data)-1), colors.lightgreen),
        ('FONTSIZE', (0, 0), (-1, -1), 10)
    ]))

    elements.append(form_table)


def add_cal_with_table(cal_pk, cal_instruments):
    global elements

    form_header = '<font size="12">%s</font>' % "Calibration Instruments:"
    elements.append(Paragraph(form_header, styles["Heading2"]))

    # relevant_categories = ItemModelCategory.objects.all().filter(calibrated_with=CalibrationEvent.objects.get(pk=cal_pk)
    #                                                              .instrument.item_model)
    #
    cal_with_data = [cal_with_headers]
    for ins in cal_instruments:
        cal_with_data.append([str(ins.item_model), ins.asset_tag])
    #     relevant_cats = []
    #     for cat in ItemModelCategory.objects.filter(item_models=ins.item_model.pk):
    #         if cat in relevant_categories:
    #             relevant_cats.append(cat.name)
    #
         # cal_with_data.append([str(ins.item_model), ins.asset_tag, ", ".join(relevant_cats)])

    cal_with_table = Table(cal_with_data)
    cal_with_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 0), (1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 11)
    ]))

    elements.append(cal_with_table)


def add_approval_table(cal_pk):
    global elements

    form_header = '<font size="12">%s</font>' % "Approval Data:"
    elements.append(Paragraph(form_header, styles["Heading2"]))

    cal_approval = CalibrationApproval.objects.get(cal_event=cal_pk)
    user = cal_approval.approver
    user_data = f"{user.get_full_name()}, ({user.username}, {user.email})"

    approval_data = [approval_headers, [cal_approval.date, user_data, cal_approval.comment]]
    approval_table = Table(approval_data)
    approval_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 0), (2, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (2, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 11)
    ]))

    elements.append(approval_table)


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

    if CalibrationEvent.objects.get(pk=cal_pk).calibrated_by_instruments.count() > 0:
        instruments_used = CalibrationEvent.objects.get(pk=cal_pk).calibrated_by_instruments.all()
        add_cal_with_table(cal_pk, instruments_used)
    else:
        text = '<font size="12">%s</font>' % "No instruments used during calibration."
        elements.append(Paragraph(text, styles["Italic"]))
        elements.append(Spacer(1, 10))

    if CalibrationEvent.objects.get(pk=cal_pk).approval_status == APPROVAL_STATUSES['approved']:
        add_approval_table(cal_pk)

    if cal_file_data[FILE_TYPE_INDEX] == 'Artifact' and is_image_file(cal_file_data[FILE_NAME_INDEX]):
        elements.append(Spacer(1, 10))
        elements.append(get_image(cal_file_data[FILE_NAME_INDEX], 4*inch))

    if cal_file_data[FILE_TYPE_INDEX] == 'Artifact' and cal_file_data[FILE_NAME_INDEX].split('.')[-1].lower() == 'pdf':
        pdf_merge = True
    else:
        pdf_merge = False

    if cal_file_data[FILE_TYPE_INDEX] == 'Artifact' and cal_file_data[FILE_NAME_INDEX].split('.')[-1].lower() == 'xlsx':
        elements.append(get_xlsx_hyperlink(cal_pk))

    if cal_file_data[FILE_TYPE_INDEX] == 'Load Bank':
        get_lb_tables(cal_pk)

    if cal_file_data[FILE_TYPE_INDEX] == 'Klufe':
        get_klufe_table(cal_pk)

    if cal_file_data[FILE_TYPE_INDEX] == 'Form':
        get_custom_table(cal_pk)

    doc.build(elements)
    return buffer, pdf_merge


def merge_pdf(cal_pk, buffer):
    merger = PdfFileMerger()

    merger.append(buffer)
    merger.append(CalibrationEvent.objects.get(pk=cal_pk).file)
    merged_buffer = BytesIO()

    merger.write(merged_buffer)
    merger.close()
    return merged_buffer


def handler(instrument):

    certificate_info, cal_file_data, cal_pk = get_fields(instrument)
    instrument_name = str(instrument).replace(" ", "_")
    filename = f"{instrument_name}_calibration_record_{date.today().strftime('%Y_%m_%d')}.pdf"
    buffer, pdf_merge = fill_pdf(BytesIO(), certificate_info, cal_file_data, cal_pk)
    buffer.seek(0)

    if pdf_merge:
        pdf_buffer = merge_pdf(cal_pk, buffer)
        pdf_buffer.seek(0)
        return FileResponse(pdf_buffer, as_attachment=True, filename=filename)

    try:
        return FileResponse(buffer, as_attachment=True, filename=filename)
    except IOError:
        return Response(status=status.HTTP_418_IM_A_TEAPOT)
