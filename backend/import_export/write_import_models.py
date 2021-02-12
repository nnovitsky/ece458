from backend.tables.serializers import ItemModelSerializer


def get_model_list(file):





def handler(verified_file):
    data = {"vendor": "v1", "model_number": "mod1", "description": "test 1", "calibration_frequency": 100}
    data2 = {"vendor": "v1", "model_number": "mod2", "description": "test 2", "calibration_frequency": 300}

    model_data = get_model_list(verified_file)
    db_model_upload = ItemModelSerializer(data=model_data, many=True)

    if not db_model_upload.is_valid(): return False, None, "Error writing models to db."

    db_model_upload.save()
    upload_summary = f"Successfuly wrote {len(model_data)} models to the database."
    return True, model_data, upload_summary
