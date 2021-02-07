from rest_framework.response import Response
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


def get_page_response(objects, request, serializerType, name, nextPage, previousPage):
    # reusable pagination function
    page = request.GET.get('page', 1)
    paginator = Paginator(objects, 10)
    try:
        data = paginator.page(page)
    except PageNotAnInteger:
        data = paginator.page(1)
    except EmptyPage:
        data = paginator.page(paginator.num_pages)

    serializer = serializerType(data, context={'request': request}, many=True)
    if data.has_next():
        nextPage = data.next_page_number()
    if data.has_previous():
        previousPage = data.previous_page_number()

    return Response({'data': serializer.data, 'count': paginator.count, 'numpages': paginator.num_pages,
                     'nextlink': '/api/' + name + '/?page=' + str(nextPage),
                     'prevlink': '/api/' + name + '/?page=' + str(previousPage)})
