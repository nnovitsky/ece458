from backend.tables.models import ItemModel


def populate():
    # to run: from Django console (manage.py), open shell
    # in shell: from backend.populate_tables import populate
    # in shell: populate()
    print(ItemModel.objects.all())
    vendors = ["v1", "v2", "v2"]
    model_nums = ["m1", "m1", "m2"]
    descs = ["item 1", "item 2", "item 3"]
    comments = ["", "none", "comment"]
    calib_freqs = [180, 0, 30]
    for i in range(len(vendors)):
        m = ItemModel(vendor=vendors[i], model_number=model_nums[i], description=descs[i],
                      comment=comments[i], calibration_frequency=calib_freqs[i])
        m.save()
        print(m.id)

    print(ItemModel.objects.all())
