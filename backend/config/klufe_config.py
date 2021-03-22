VOLTAGE_LEVELS = [
    {
        'source_voltage': 3.500,
        'is_AC': False,
        'description': "3.500V " + u"\u00B1" + "0.001",
        'lower': 3.500-0.001,
        'upper': 3.500+0.001
    },
    {
        'source_voltage': 3.513,
        'is_AC': True,
        'Hz': 50.0,
        'description': "3.500V " + u"\u00B1" + "0.002",
        'lower': 3.500-0.002,
        'upper': 3.500+0.002
    },
    {
        'source_voltage': 100.0,
        'is_AC': True,
        'Hz': 20000.0,
        'description': "100.0V " + u"\u00B1" + "0.2",
        'lower': 100-0.2,
        'upper': 100+0.2
    },
    {
        'source_voltage': 3.500,
        'is_AC': True,
        'Hz': 10000.0,
        'description': "3.500V " + u"\u00B1" + "0.004",
        'lower': 3.500-0.004,
        'upper': 3.500+0.004
    },
    {
        'source_voltage': 35.00,
        'is_AC': True,
        'Hz': 10000.0,
        'description': "35.00V " + u"\u00B1" + "0.04",
        'lower': 35.00-0.04,
        'upper': 35.00+0.04
    },
]