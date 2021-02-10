from io import BytesIO

from reportlab.pdfgen import canvas
from rest_framework.response import Response

from backend.tables.models import ItemModel, Instrument, CalibrationEvent


def handler(request, ItemModel):



    response = Response(content_type='application/pdf')
    response['Content-Disposition'] = 'inline; filename=hello_world.pdf'

    buffer = BytesIO()
    p = canvas.Canvas(buffer)
    p.drawString(100, 100, "Hello world.")

    p.showPage()
    p.save()

    pdf = buffer.getvalue()
    buffer.close()
    response.write(pdf)

    return response