FORM_FIELDS = {
    'header': "HEADER",
    'plaintext': "PLAINTEXT",
    'text_input': "TEXT_INPUT",
    'float_input': "FLOAT_INPUT",
    'bool_input': "BOOL_INPUT"
}

ALL_FIELDS = {
    'label',
    'plaintext',
    'expected_string',
    'expected_min',
    'expected_max',
    'actual_string',
    'actual_float',
    'actual_bool',
    'value_okay'
}

EXPECTED_FIELDS = {
    'HEADER': {'label'},
    'PLAINTEXT': {'plaintext'},
    'TEXT_INPUT': {'label', 'expected_string'},
    'FLOAT_INPUT': {'label', 'expected_min', 'expected_max'},
    'BOOL_INPUT': {'label'}
}


