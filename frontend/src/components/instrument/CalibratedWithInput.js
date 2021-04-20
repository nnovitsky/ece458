import React, { useReducer, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Badge from 'react-bootstrap/Badge';
import InstrumentServices from '../../api/instrumentServices';

const instrumentServices = new InstrumentServices();
let instrumentPk;
// onInstrumentChange: an event handler that will be called whenever an
// instrument is added or removed. this will be passed an array of instrument pks
// calibratorCategories: an array of acceptable calibrator category names to be displayed (if an empty array, this component will be hidden)
// instrumentPk: the instrument pk of the instrument BEING calibrated
const CalibratedWithInput = (props) => {
    const [calibratorState, dispatch] = useReducer(reducer, getEmptyState());

    useEffect(() => {
        instrumentPk = props.instrumentPk;
        if(calibratorState.callParent) {
            props.onInstrumentChange(calibratorState.instrumentsAdded.map(x => x.instrument_pk));
            instrumentPk = props.instrumentPk;
            dispatch({ type: 'set_call_parent', payload: false });
        }
    }, [calibratorState.callParent, calibratorState.instrumentsAdded, props]);
    return (
        <div hidden={props.calibratorCategories.length === 0} className="calibrator-instrument-div" onKeyUp={(e) => e.key === 'Enter' ? onAddInstrument(calibratorState, dispatch) : null}>
            <Form.Label>Calibrator Instruments</Form.Label>
            <Form.Text muted>Calibrator Categories: {props.calibratorCategories.join(', ')}</Form.Text>
            <InputGroup noValidate style={{padding: '0px'}}>
                <FormControl
                style={{margin: '0px'}}
                    required
                    type="text"
                    placeholder="Asset Tag"
                    className={getClassName(calibratorState)}
                    value={calibratorState.textInput}
                    onChange={(e) => onTextInput(e.target.value, dispatch, calibratorState)}
                />
                <InputGroup.Append>
                    <Button onClick={() => onAddInstrument(calibratorState, dispatch)} disabled={!calibratorState.isValidText}>+</Button>
                </InputGroup.Append>
                <Form.Control.Feedback type="invalid">
                    {(calibratorState.errors && calibratorState.errors.length > 0) ? calibratorState.errors[0] : null}

                </Form.Control.Feedback>
            </InputGroup>
            <div className="badge-container">
                {calibratorState.instrumentsAdded.length > 0 ? getBadgeList(calibratorState, dispatch) : <span style={{width: "100%", textAlign: "center"}}>(No Instruments Added)</span>}
            </div>
        </div>
    );
}

const getBadgeList = (calibratorState, dispatch) => {
    const result = [];
    calibratorState.instrumentsAdded.forEach((instrument) => {
        const badge = badgeWithButton(`${instrument.instrument_name} ${instrument.asset_tag}`, instrument.instrument_pk, (pk) => onRemoveInstrument(dispatch, pk));
        result.push(badge);
    });
    return result;
}

const badgeWithButton = (text, value, onRemove) => {
    return (
        <div className="instrument-badge" key={value}>
            <Badge pill variant="primary">
                {text}
                <Button onClick={() => onRemove(value)}>X</Button>
            </Badge>
        </div>
    );
}

function reducer(state, action) {
    switch (action.type) {
        case 'text_input':
            return { ...state, textInput: action.payload };
        case 'set_current_instrument':
            return {...state, currentInstrument: action.payload};
        case 'add_instrument':
            const newArray = [...state.instrumentsAdded];
            const pay = action.payload;
            pay.name = 'Fluke-XY200'
            newArray.push(pay);
            return { ...state, instrumentsAdded: newArray };
        case 'remove_instrument':
            const finalArray = [...state.instrumentsAdded].filter(x => x.instrument_pk !== action.payload);
            return { ...state, instrumentsAdded: finalArray };
        case 'set_valid':
            return { ...state, isValidText: action.payload };
        case 'set_errors':
            return { ...state, errors: action.payload };
        case 'set_call_parent':
            return {...state, callParent: action.payload};
        case 'clear':
            return getEmptyState();
        default:
            console.log(action.type);
            console.log(action.payload);
            throw new Error();
    }
}

const getClassName = (calibratorState) => {
    if (calibratorState.isValidText === null) {
        return null;
    } else if (calibratorState.isValidText) {
        return 'is-valid';
    } else {
        return 'is-invalid';
    }
}

const onTextInput = async (text, dispatch, calibratorState) => {
    dispatch({ type: 'text_input', payload: text });
    if (text.length < 6) {
        dispatch({ type: 'set_valid', payload: null });
        dispatch({ type: 'set_errors', payload: [] });
    }
    if (text.length === 6) {
        if (hasInstrumentAlready(calibratorState.instrumentsAdded, text)) {
            dispatch({ type: 'set_valid', payload: false });
            dispatch({ type: 'set_errors', payload: ['This instrument has already been added'] });
        } else {
            await instrumentServices.validateCalibratorInstrument(instrumentPk, text).then((result) => {
                if (result.success) {
                    if (result.data.is_valid) {
                        console.log(result);
                        const currentInstrument = {
                            instrument_pk: result.data.calibrated_by_instruments[0],
                            asset_tag: text,
                            instrument_name: result.data.instrument_name
                        }
                        dispatch({ type: 'set_current_instrument', payload: currentInstrument});
                        dispatch({ type: 'set_valid', payload: true });
                    } else {
                        dispatch({ type: 'set_valid', payload: false });
                        dispatch({ type: 'set_errors', payload: result.data.calibration_errors });
                    }
                }
            })
        }
    }
    if (text.length > 6) {
        dispatch({ type: 'set_valid', payload: false });
        dispatch({ type: 'set_errors', payload: ['Value entered is too long, not a valid asset tag'] });
    }

}

const hasInstrumentAlready = (currentInstruments, newAssetTag) => {
    const currentAssetTags = currentInstruments.map(x => x.asset_tag);
    return currentAssetTags.includes(newAssetTag);
}

const onAddInstrument = (calibratorState, dispatch) => {
    if (calibratorState.isValidText) {
        dispatch({ type: 'add_instrument', payload: calibratorState.currentInstrument });
        dispatch({ type: 'set_call_parent', payload: true });
        dispatch({ type: 'text_input', payload: '' });
        dispatch({ type: 'set_valid', payload: null });
    }
}

const onRemoveInstrument = (dispatch, pk) => {
    dispatch({ type: 'remove_instrument', payload: pk });
}

const getEmptyState = () => {
    return {
        textInput: '',
        instrumentsAdded: [],
        errors: [],
        isValidText: null,
        currentInstrument: {
            instrument_pk: null,
            asset_tag: null,
            instrument_name: null
        },
        callParent: false,
    };
}

export default CalibratedWithInput;