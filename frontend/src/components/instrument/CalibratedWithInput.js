import React, { useReducer } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Badge from 'react-bootstrap/Badge';

let count = 1;
// onInstrumentChange: an event handler that will be called whenever an
// instrument is added or removed. this will be passed an array of objects containing
// the instrument_pk and the asset tag
const CalibratedWithInput = (props) => {
    const [calibratorState, dispatch] = useReducer(reducer, getEmptyState());

    return (
        <div className="calibrator-instrument-div" onKeyUp={(e) => e.key==='Enter' ? onAddInstrument(calibratorState, dispatch) : null}>
            <Form.Label>Calibrator Instruments</Form.Label>
                <InputGroup noValidate validated={false}>
                    <FormControl
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
                        {calibratorState.errors}

                    </Form.Control.Feedback>
                </InputGroup>
                <div className="badge-container">
                {getBadgeList(calibratorState, dispatch)}
                </div>
        </div>
    );
}

const getBadgeList = (calibratorState, dispatch) => {
    const result = [];
    calibratorState.instrumentsAdded.forEach((instrument) => {
        const badge = badgeWithButton(instrument.asset_tag, instrument.instrument_pk, (pk) => dispatch({ type: 'remove_instrument', payload: pk }));
        result.push(badge);
    });
    return result;
}

const badgeWithButton = (text, value, onRemove) => {
    return (
        <div className="instrument-badge">
            <Badge pill variant="primary" key={value}>
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
        case 'add_instrument':
            const newArray = [...state.instrumentsAdded];
            newArray.push(action.payload);
            return { ...state, instrumentsAdded: newArray };
        case 'remove_instrument':
            const finalArray = [...state.instrumentsAdded].filter(x => x.instrument_pk !== action.payload);
            return { ...state, instrumentsAdded: finalArray };
        case 'set_valid':
            return { ...state, isValidText: action.payload };
        case 'set_errors':
            return { ...state, errors: action.payload };
        case 'clear':
            return getEmptyState();
        default:
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

const onTextInput = (text, dispatch, calibratorState) => {
    dispatch({ type: 'text_input', payload: text });
    if (text.length < 6) {
        dispatch({ type: 'set_valid', payload: null });
        dispatch({ type: 'set_errors', payload: [] });
    }
    if (text.length === 6) {
        dispatch({ type: 'set_valid', payload: true });
        dispatch({ type: 'set_errors', payload: [] });

    }
    if (text.length > 6) {
        dispatch({ type: 'set_valid', payload: false });
        dispatch({ type: 'set_errors', payload: ['Too long'] });
    }

}

const onAddInstrument = (calibratorState, dispatch) => {
    if(calibratorState.isValidText) {
        const newInstrument = {
            instrument_pk: count,
            asset_tag: calibratorState.textInput,
        };
        count++;
        dispatch({ type: 'add_instrument', payload: newInstrument });
        dispatch({ type: 'text_input', payload: '' });
        dispatch({ type: 'set_valid', payload: null });
    }

}

const getEmptyState = () => {
    return {
        textInput: '',
        instrumentsAdded: [],
        errors: [],
        isValidText: null,
    };
}

export default CalibratedWithInput;