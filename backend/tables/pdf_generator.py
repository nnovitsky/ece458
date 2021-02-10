import os
from io import BytesIO

from reportlab.pdfgen.canvas import Canvas
from rest_framework import status
from rest_framework.response import Response
from django.http import FileResponse

from backend.tables.models import ItemModel, Instrument, CalibrationEvent

FILE_NAME = 'hello_world.pdf'

def write_pdf():
    hello_pdf = Canvas(FILE_NAME)
    hello_pdf.drawString(50,780,"hello world!")
    hello_pdf.save()

    path = os.getcwd()
    return path.join(FILE_NAME)
    # buffer = BytesIO()
    # p = canvas.Canvas(buffer)
    # p.drawString(100, 100, "Hello world.")
    # p.showPage()
    # p.save()
    # pdf = buffer.getvalue()
    # buffer.close()

def buffer_write():
    buffer = BytesIO()
    p = Canvas(buffer)
    p.drawString(50, 780, "Hello world.")
    # Close the PDF object cleanly, and we're done.
    p.showPage()
    p.save()
    # FileResponse sets the Content-Disposition header so that browsers
    # present the option to save the file.
    buffer.seek(0)
    try:
        return FileResponse(buffer, as_attachment=True, filename='hello.pdf')
    except IOError:
        Response(status=status.HTTP_418_IM_A_TEAPOT)



def handler(request, ItemModel):

    file_path = write_pdf()

    try:
        # with open(file_path, 'r') as f:
        #     file_data = f.read()
        #
        # response = FileResponse(file_data)
        # response = Response(data=f"attachment; filename={FILE_NAME}",
        #                     content_type='application/pdf')

        f = open(file_path, 'r')
        pdfFile = File(f)
        response = HttpResponse(pdfFile.read())
        response = Response(content_type='application/pdf')
        response['Content-Disposition'] = f"attachment; filename={FILE_NAME}"
        return response


    except IOError:
        response = Response(status=status.HTTP_418_IM_A_TEAPOT)

    return response
