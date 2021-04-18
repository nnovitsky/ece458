from backend.config.load_bank_config import DEFAULT_CATEGORIES
from backend.tables.models import ItemModelCategory


def get_special_pks():
    for cat_name in DEFAULT_CATEGORIES:
        try:
            category = ItemModelCategory.objects.get(name=cat_name)