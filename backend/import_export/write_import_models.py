import csv
import io

from backend.tables.serializers import ItemModelSerializer
model_keys = ['vendor', 'model_number', 'description', 'comment', 'calibration_frequency',]


def get_model_list(file):
    model_records = []
    file.seek(0)
    reader = csv.reader(io.StringIO(file.read().decode('utf-8')))
    headers = next(reader)
    for row in reader:
        model_record = dict(zip(model_keys, row))
        model_records.append(model_record)

    return model_records


def handler(verified_file):

    model_data = get_model_list(verified_file)
    db_model_upload = ItemModelSerializer(data=model_data, many=True)

    if not db_model_upload.is_valid(): return False, None, "Error writing models to db."

    db_model_upload.save()
    upload_summary = f"Successfully wrote {len(model_data)} model(s) to the database."
    return True, model_data, upload_summary
