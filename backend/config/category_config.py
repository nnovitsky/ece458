from backend.config.load_bank_config import DEFAULT_CATEGORIES
from backend.tables.models import ItemModelCategory


def get_special_pks():
    pks = []

    for cat_name in DEFAULT_CATEGORIES:
        try:
            category = ItemModelCategory.objects.get(name=cat_name)
        except ItemModelCategory.DoesNotExist:
            category = ItemModelCategory(name=cat_name)
            category.save()
        pks.append(category.pk)

    return pks