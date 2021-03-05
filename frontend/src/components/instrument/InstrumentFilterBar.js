import React, { useReducer, useEffect } from 'react';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import Button from 'react-bootstrap/esm/Button';
import ModelCategoriesPicklist from '../generic/picklist/ModelCategoriesPicklist';
import InstrumentCategoriesPicklist from '../generic/picklist/InstrumentCategoriesPicklist';

const modelName = "model";
const vendorName = "vendor";
const serialName = "serial";
const descriptionName = "description";

//'onSearch' prop event handler for when the search button is clicked, will receive a filters object ^seen above
// 'onRemoveFilters' prop event handler for when the filters should be removed
// 'onFilterChange' a handler that will be passed ^filters
// 'currentFilter' must match filters ^ 
// modelCategories  an array of pk/category pairs
// instrumentCategories: an array of pk/category pairs
const InstrumentFilterBar = (props) => {

    const [filterState, dispatch] = useReducer(reducer, props.currentFilter);
    useEffect(() => {
        dispatch({ type: 'setAll', payload: props.currentFilter });
    }, [props.currentFilter])
    // modelCategories = formatCategories(props.modelCategories);
    // instrumentCategories = formatCategories(props.instrumentCategories);
    return (
        <Container className="filter-column">
            <Col>
                <h3>Filters</h3>
                <Form.Control name={vendorName} type="text" placeholder="Enter Vendor" onChange={(e) => dispatch({ type: 'vendor', payload: e.target.value })} value={filterState.vendor} />

                <Form.Control name={modelName} type="text" placeholder="Enter Model Number" onChange={(e) => dispatch({ type: 'model_number', payload: e.target.value })} value={filterState.model_number} />

                <Form.Control name={serialName} type="text" placeholder="Enter Serial" onChange={(e) => dispatch({ type: 'serial_number', payload: e.target.value })} value={filterState.serial_number} />

                <Form.Control name={descriptionName} type="text" placeholder="Description" onChange={(e) => dispatch({ type: 'description', payload: e.target.value })} value={filterState.description} />

                <div className="filter-picklist">
                    <ModelCategoriesPicklist
                        selectedCategories={filterState.model_categories}
                        onChange={(e) => dispatch({ type: 'model_categories', payload: e })}
                    />
                </div>
                <div className="filter-picklist">
                    <InstrumentCategoriesPicklist
                        selectedCategories={props.currentFilter.instrument_categories}
                        onChange={(e) => dispatch({ type: 'instrument_categories', payload: e })}
                    />
                </div>


                <Button className="filter-button" onClick={() => props.onSearch(filterState)}>Apply</Button>
                <Button className="filter-button" onClick={() => onClear(props.onRemoveFilters, dispatch)}>Clear</Button>


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
            return { ...state, description: action.payload }
        case 'model_categories':
            return { ...state, model_categories: action.payload };
        case 'instrument_categories':
            return { ...state, instrument_categories: action.payload };
        case 'clear':
            return {
                model_number: '',
                vendor: '',
                serial_number: '',
                description: '',
                model_categories: [],
                instrument_categories: []
            };
        case 'setAll':
            return action.payload;
        default:
            throw new Error();
    }
}

// const onTextInput = (e, filterChange) => {
//     switch (e.target.name) {
//         case modelName:
//             filters.model_number = e.target.value;
//             filterChange(filters);
//             break;
//         case vendorName:
//             filters.vendor = e.target.value;
//             filterChange(filters);
//             break;
//         case serialName:
//             filters.serial_number = e.target.value;
//             filterChange(filters);
//             break;
//         case descriptionName:
//             filters.description = e.target.value;
//             filterChange(filters);
//             break;
//         default:
//             break;
//     }
// }

// const onCategoryInput = (e, filterChange, type) => {
//     console.log(e);
//     switch (type) {
//         case 'model':
//             filters.model_categories = e;
//             break;
//         case 'instrument':
//             filters.instrument_categories = e;
//             break;
//         default:
//             break;
//     }
//     filterChange(filters);
// }


const onClear = (parentHandler, dispatch) => {
    dispatch({ type: 'clear' });
    parentHandler();
}

export default InstrumentFilterBar;

InstrumentFilterBar.defaultProps = {
    modelCategories: [],
}