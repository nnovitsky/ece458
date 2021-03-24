import React, { useReducer, useEffect, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import Button from 'react-bootstrap/esm/Button';
import ModelCategoriesPicklist from '../generic/picklist/ModelCategoriesPicklist';
import InstrumentCategoriesPicklist from '../generic/picklist/InstrumentCategoriesPicklist';
import Alert from 'react-bootstrap/esm/Alert';

const modelName = "model";
const vendorName = "vendor";
const serialName = "serial";
const descriptionName = "description";
const assetName = "assetTag";

//'onSearch' prop event handler for when the search button is clicked, will receive a filters object ^seen above
// 'onRemoveFilters' prop event handler for when the filters should be removed
// 'isWarning' prop that will decide if a warning should be displayed when the user clicks in the filter box
const InstrumentFilterBar = (props) => {

    const [filterState, dispatch] = useReducer(reducer, getEmptyFilters());
    const [isWarningShown, setWarningShown] = useState(props.isWarning);

    useEffect(() => {
        let searchParams = window.sessionStorage.getItem("instrumentPageSearchParams");
        let filters = JSON.parse(searchParams).filters;
        dispatch({ type: 'setAll', payload: filters });
    }, []);

    // modelCategories = formatCategories(props.modelCategories);
    // instrumentCategories = formatCategories(props.instrumentCategories);
    return (
        <Container className="filter-column" onKeyPress={(e) => handleKeyPress(e, props.onSearch, filterState)} onMouseEnter={() => onMouseEnterHandler(props.isWarning, setWarningShown)} onMouseLeave={() => setWarningShown(false)}>
            <Col>
                <h3>Filters</h3>
                <Form.Control name={vendorName} type="text" placeholder="Enter Vendor" onChange={(e) => dispatch({ type: 'vendor', payload: e.target.value })} value={filterState.vendor} />

                <Form.Control name={modelName} type="text" placeholder="Enter Model Number" onChange={(e) => dispatch({ type: 'model_number', payload: e.target.value })} value={filterState.model_number} />

                <Form.Control name={descriptionName} type="text" placeholder="Description" onChange={(e) => dispatch({ type: 'description', payload: e.target.value })} value={filterState.description} />

                <Form.Control name={assetName} type="text" placeholder="Enter Asset Tag" onChange={(e) => dispatch({ type: 'asset_tag', payload: e.target.value })} value={filterState.asset_tag} />

                <Form.Control name={serialName} type="text" placeholder="Enter Serial" onChange={(e) => dispatch({ type: 'serial_number', payload: e.target.value })} value={filterState.serial_number} />



                <div className="filter-picklist">
                    <ModelCategoriesPicklist
                        selectedCategories={filterState.model_categories}
                        onChange={(e) => dispatch({ type: 'model_categories', payload: e })}
                    />
                </div>
                <div className="filter-picklist">
                    <InstrumentCategoriesPicklist
                        selectedCategories={filterState.instrument_categories}
                        onChange={(e) => dispatch({ type: 'instrument_categories', payload: e })}
                    />
                </div>


                <Button className="filter-button" onClick={() => onSubmit(props.onSearch, filterState)}>Apply</Button>
                <Button className="filter-button" onClick={() => onClear(props.onRemoveFilters, dispatch)}>Clear</Button>

                <Alert hidden={!isWarningShown} variant={'danger'} className="alert-popup">Warning: new filters will clear selections</Alert>
            </Col>
        </Container>
    )
}

function reducer(state, action) {
    switch (action.type) {
        case 'vendor':
            return { ...state, vendor: action.payload };
        case 'model_number':
            return { ...state, model_number: action.payload };
        case 'serial_number':
            return { ...state, serial_number: action.payload };
        case 'description':
            return { ...state, description: action.payload };
        case 'asset_tag':
            return { ...state, asset_tag: action.payload };
        case 'model_categories':
            return { ...state, model_categories: action.payload };
        case 'instrument_categories':
            return { ...state, instrument_categories: action.payload };
        case 'asset_tag':
            return { ...state, asset_tag: action.payload };
        case 'clear':
            return {
                model_number: '',
                vendor: '',
                description: '',
                asset_tag: '',
                serial_number: '',
                model_categories: [],
                instrument_categories: []
            };
        case 'setAll':
            return action.payload;
        default:
            throw new Error();
    }
}

// searches on enter
const handleKeyPress = (e, parentOnSubmit, filterState) => {
    switch (e.code) {
        case 'Enter':
            onSubmit(parentOnSubmit, filterState);
        default:
            return;
    }
}

const onMouseEnterHandler = (isWarning, setWarningShown) => {
    console.log('entered');
    if (isWarning) {
        setWarningShown(true);
    }
}

const onSubmit = (parentHandler, filterState) => {
    let searchParams = window.sessionStorage.getItem("instrumentPageSearchParams");
    searchParams = JSON.parse(searchParams);
    searchParams.filters = filterState;
    window.sessionStorage.setItem("instrumentPageSearchParams", JSON.stringify(searchParams));
    parentHandler();
}

const onClear = (parentHandler, dispatch) => {
    dispatch({ type: 'clear' });
    let searchParams = window.sessionStorage.getItem("instrumentPageSearchParams");
    searchParams = JSON.parse(searchParams);
    searchParams.filters = getEmptyFilters();
    window.sessionStorage.setItem("instrumentPageSearchParams", JSON.stringify(searchParams));
    parentHandler();
}

const getEmptyFilters = () => {
    return (
        {
            model_number: '',
            vendor: '',
            serial_number: '',
            asset_tag: '',
            description: '',
            asset_tag: '',
            model_categories: [],
            instrument_categories: []
        }
    )
}

export default InstrumentFilterBar;

InstrumentFilterBar.defaultProps = {
    modelCategories: [],
}