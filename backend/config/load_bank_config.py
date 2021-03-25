CALIBRATION_MODES = [
    "load_bank",
    "klufe_k5700"
]

CR_THRESHOLD = 0.03
CA_THRESHOLD = 0.05
CR_AND_CA_ERROR = "Measured current is >3% off and actual current is >5% off. Double check your input values or adjust ppm settings, check and repair or replace load cell, then restart."
CR_ERROR_MESSAGE = "Measured current is >3% off. Double check your input values or adjust ppm settings to fix, then restart."
CA_ERROR_MESSAGE = "Actual current is >5% off. Double check your input values or check and repair or replace load cell, then restart."
C_DIVIDE_BY_ZERO = "Current cannot be zero for this load. Your last correctly formed input is saved, if applicable. Double check your input values or check and repair or replace load cell, then restart."
NO_LOAD_ERROR_MESSAGE = "Current with no load must be zero."
VR_THRESHOLD = 0.01
VA_THRESHOLD = 0.1
VR_AND_VA_ERROR = "Measured voltage is >1% off and actual voltage is below 43.2V. Double check your input values or adjust ppm settings, check DC source, and redo calibration."
VR_ERROR_MESSAGE = "Measured voltage is >1% off. Double check your input values or adjust ppm settings to fix, then check voltage again."
VA_ERROR_MESSAGE = "Actual voltage is below 43.2V--that’s too much sag. Double check your input values or check DC source and redo calibration."
V_DIVIDE_BY_ZERO = "Voltage cannot be zero. Your last correctly formed input is saved, if applicable. Double check your input values or check DC source and redo calibration."

VOLTAGE_TEST = {
    'voltage_text': "Voltages with all banks on:",
    'test_voltage': 48
}

LOAD_LEVELS = {
    1: [
        {
            'load': 'No load',
            'ideal': 0,
            'index': 1,
        },
        {
            'load': '1 x 100A',
            'ideal': 100,
            'index': 2,
        },
        {
            'load': '2 x 100A',
            'ideal': 200,
            'index': 3,
        },
        {
            'load': '3 x 100A',
            'ideal': 300,
            'index': 4,
        },
        {
            'load': '4 x 100A',
            'ideal': 400,
            'index': 5,
        },
        {
            'load': '5 x 100A',
            'ideal': 500,
            'index': 6,
        },
        {
            'load': '6 x 100A',
            'ideal': 600,
            'index': 7,
        },
        {
            'load': '7 x 100A',
            'ideal': 700,
            'index': 8,
        },
        {
            'load': '8 x 100A',
            'ideal': 800,
            'index': 9,
        },
        {
            'load': '9 x 100A',
            'ideal': 900,
            'index': 10,
        },
        {
            'load': '10 x 100A',
            'ideal': 1000,
            'index': 11,
        },
    ],
    2: [
        {
            'load': '10 x 100A + 1 x 20A',
            'ideal': 1020,
            'index': 12,
        },
        {
            'load': '10 x 100A + 2 x 20A',
            'ideal': 1040,
            'index': 13,
        },
        {
            'load': '10 x 100A + 3 x 20A',
            'ideal': 1060,
            'index': 14,
        },
        {
            'load': '10 x 100A + 4 x 20A',
            'ideal': 1080,
            'index': 15,
        },
        {
            'load': '10 x 100A + 5 x 20A',
            'ideal': 1100,
            'index': 16,
        },
    ],
    3: [
        {
            'load': '10 x 100A + 5 x 20A + 1 x 1A',
            'ideal': 1101,
            'index': 17,
        },
        {
            'load': '10 x 100A + 5 x 20A + 2 x 1A',
            'ideal': 1102,
            'index': 18,
        },
        {
            'load': '10 x 100A + 5 x 20A + 3 x 1A',
            'ideal': 1103,
            'index': 19,
        },
        {
            'load': '10 x 100A + 5 x 20A + 4 x 1A',
            'ideal': 1104,
            'index': 20,
        },
        {
            'load': '10 x 100A + 5 x 20A + 5 x 1A',
            'ideal': 1105,
            'index': 21,
        },
        {
            'load': '10 x 100A + 5 x 20A + 6 x 1A',
            'ideal': 1106,
            'index': 22,
        },
        {
            'load': '10 x 100A + 5 x 20A + 7 x 1A',
            'ideal': 1107,
            'index': 23,
        },
        {
            'load': '10 x 100A + 5 x 20A + 8 x 1A',
            'ideal': 1108,
            'index': 24,
        },
        {
            'load': '10 x 100A + 5 x 20A + 9 x 1A',
            'ideal': 1109,
            'index': 25,
        },
        {
            'load': '10 x 100A + 5 x 20A + 10 x 1A',
            'ideal': 1110,
            'index': 26,
        },
    ],
    4: [
        {
            'load': '10 x 100A + 5 x 20A + 11 x 1A',
            'ideal': 1111,
            'index': 27,
        },
        {
            'load': '10 x 100A + 5 x 20A + 12 x 1A',
            'ideal': 1112,
            'index': 28,
        },
        {
            'load': '10 x 100A + 5 x 20A + 13 x 1A',
            'ideal': 1113,
            'index': 29,
        },
        {
            'load': '10 x 100A + 5 x 20A + 14 x 1A',
            'ideal': 1114,
            'index': 30,
        },
        {
            'load': '10 x 100A + 5 x 20A + 15 x 1A',
            'ideal': 1115,
            'index': 31,
        },
        {
            'load': '10 x 100A + 5 x 20A + 16 x 1A',
            'ideal': 1116,
            'index': 32,
        },
        {
            'load': '10 x 100A + 5 x 20A + 17 x 1A',
            'ideal': 1117,
            'index': 33,
        },
        {
            'load': '10 x 100A + 5 x 20A + 18 x 1A',
            'ideal': 1118,
            'index': 34,
        },
        {
            'load': '10 x 100A + 5 x 20A + 19 x 1A',
            'ideal': 1119,
            'index': 35,
        },
        {
            'load': '10 x 100A + 5 x 20A + 20 x 1A',
            'ideal': 1120,
            'index': 36,
        },
    ]
}