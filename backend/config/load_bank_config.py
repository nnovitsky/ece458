CALIBRATION_MODES = [
    "load_bank"
]

CR_THRESHOLD = 0.03
CA_THRESHOLD = 0.05
CR_AND_CA_ERROR = "Measured current is >3% off and actual current is >5% off. Double check your input values or adjust ppm settings, check and repair or replace load cell, then restart."
CR_ERROR_MESSAGE = "Measured current is >3% off. Double check your input values or adjust ppm settings to fix, then restart."
CA_ERROR_MESSAGE = "Actual current is >5% off. Double check your input values or check and repair or replace load cell, then restart."
C_DIVIDE_BY_ZERO = "Current cannot be zero for this load. Double check your input values or check and repair or replace load cell, then restart."
NO_LOAD_ERROR_MESSAGE = "Current with no load must be zero."
VR_THRESHOLD = 0.01
VA_THRESHOLD = 0.1
VR_AND_VA_ERROR = "Measured voltage is >1% off and actual voltage is below 43.2V. Double check your input values or adjust ppm settings, check DC source, and redo calibration."
VR_ERROR_MESSAGE = "Measured voltage is >1% off. Double check your input values or adjust ppm settings to fix, then check voltage again."
VA_ERROR_MESSAGE = "Actual voltage is below 43.2V--that’s too much sag. Double check your input values or check DC source and redo calibration."
V_DIVIDE_BY_ZERO = "Voltage cannot be zero. Double check your input values or check DC source and redo calibration."

VOLTAGE_TEST = {
    'voltage_text': "Voltages with all banks on:",
    'test_voltage': 48
}

LOAD_LEVELS = {
    1: [
        {
            'load_level': 'No load',
            'ideal_current': 0,
            'index': 1,
        },
        {
            'load_level': '1 x 100A',
            'ideal_current': 100,
            'index': 2,
        },
        {
            'load_level': '2 x 100A',
            'ideal_current': 200,
            'index': 3,
        },
        {
            'load_level': '3 x 100A',
            'ideal_current': 300,
            'index': 4,
        },
        {
            'load_level': '4 x 100A',
            'ideal_current': 400,
            'index': 5,
        },
        {
            'load_level': '5 x 100A',
            'ideal_current': 500,
            'index': 6,
        },
        {
            'load_level': '6 x 100A',
            'ideal_current': 600,
            'index': 7,
        },
        {
            'load_level': '7 x 100A',
            'ideal_current': 700,
            'index': 8,
        },
        {
            'load_level': '8 x 100A',
            'ideal_current': 800,
            'index': 9,
        },
        {
            'load_level': '9 x 100A',
            'ideal_current': 900,
            'index': 10,
        },
        {
            'load_level': '10 x 100A',
            'ideal_current': 1000,
            'index': 11,
        },
    ],
    2: [
        {
            'load_level': '10 x 100A + 1 x 20A',
            'ideal_current': 1020,
            'index': 12,
        },
        {
            'load_level': '10 x 100A + 2 x 20A',
            'ideal_current': 1040,
            'index': 13,
        },
        {
            'load_level': '10 x 100A + 3 x 20A',
            'ideal_current': 1060,
            'index': 14,
        },
        {
            'load_level': '10 x 100A + 4 x 20A',
            'ideal_current': 1080,
            'index': 15,
        },
        {
            'load_level': '10 x 100A + 5 x 20A',
            'ideal_current': 1100,
            'index': 16,
        },
    ],
    3: [
        {
            'load_level': '10 x 100A + 5 x 20A + 1 x 1A',
            'ideal_current': 1101,
            'index': 17,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 2 x 1A',
            'ideal_current': 1102,
            'index': 18,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 3 x 1A',
            'ideal_current': 1103,
            'index': 19,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 4 x 1A',
            'ideal_current': 1104,
            'index': 20,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 5 x 1A',
            'ideal_current': 1105,
            'index': 21,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 6 x 1A',
            'ideal_current': 1106,
            'index': 22,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 7 x 1A',
            'ideal_current': 1107,
            'index': 23,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 8 x 1A',
            'ideal_current': 1108,
            'index': 24,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 9 x 1A',
            'ideal_current': 1109,
            'index': 25,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 10 x 1A',
            'ideal_current': 1110,
            'index': 26,
        },
    ],
    4: [
        {
            'load_level': '10 x 100A + 5 x 20A + 11 x 1A',
            'ideal_current': 1111,
            'index': 27,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 12 x 1A',
            'ideal_current': 1112,
            'index': 28,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 13 x 1A',
            'ideal_current': 1113,
            'index': 29,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 14 x 1A',
            'ideal_current': 1114,
            'index': 30,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 15 x 1A',
            'ideal_current': 1115,
            'index': 31,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 16 x 1A',
            'ideal_current': 1116,
            'index': 32,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 17 x 1A',
            'ideal_current': 1117,
            'index': 33,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 18 x 1A',
            'ideal_current': 1118,
            'index': 34,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 19 x 1A',
            'ideal_current': 1119,
            'index': 35,
        },
        {
            'load_level': '10 x 100A + 5 x 20A + 20 x 1A',
            'ideal_current': 1120,
            'index': 36,
        },
    ]
}