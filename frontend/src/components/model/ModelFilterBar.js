import React, { useEffect, useReducer } from 'react';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import ModelCategoriesPicklist from '../generic/picklist/ModelCategoriesPicklist';

import Button from 'react-bootstrap/Button';

import '../generic/FilterBar.css';

const modelName = "model";
const vendorName = "vendor";
const descriptionName = "description";

// let filters = {
//     model_number: '',
//     vendor: '',
//     description: '',
//     model_categories: [],
// }

// 'onSearch" a prop handler that is called when search is clicked, it will be passed a filters object^
// 'onRemoveFilters' a prop that will be called when user wants to remove filters
// 'currentFilter' must match filters ^ 
const ModelFilterBar = (props) => {

    const [filterState, dispatch] = useReducer(reducer, props.currentFilter);

    useEffect(() => {
        dispatch({ type: 'setAll', payload: props.currentFilter });
    }, [props.currentFilter])

    return (

        <Container className="filter-column">
            <Col>

                <h3>Filters</h3>
                <Form.Control name={vendorName} type="text" placeholder="Enter Vendor" onChange={(e) => dispatch({ type: 'vendor', payload: e.target.value })} value={filterState.vendor} />
                <Form.Control name={modelName} type="text" placeholder="Enter Model Number" onChange={(e) => dispatch({ type: 'model', payload: e.target.value })} value={filterState.model_number} />


                <Form.Control name={descriptionName} type="text" placeholder="Enter Description" onChange={(e) => dispatch({ type: 'description', payload: e.target.value })} value={filterState.description} />

                <div className="filter-picklist">
                    <ModelCategoriesPicklist
                        selectedCategories={filterState.model_categories}
                        onChange={(filterList) => onCategoryInput(filterList, dispatch)}
                    />
                </div>

                <Button onClick={() => props.onSearch(filterState)}>Apply</Button>
                <Button onClick={() => onRemove(props.onRemoveFilters, dispatch)}>Clear</Button>
            </Col>


        </Container>

    )
}

function reducer(state, action) {
    switch (action.type) {
        case 'vendor':
            return { ...state, vendor: action.payload };
        case 'model':
            return { ...state, model_number: action.payload };
        case 'description':
            return { ...state, description: action.payload };
        case 'model_categories':
            return { ...state, model_categories: action.payload };
        case 'clear':
            return {
                vendor: '',
                model_number: '',
                description: '',
                model_categories: []
            };
        case 'setAll':
            return action.payload;
        default:
            throw new Error();
    }
}

const onCategoryInput = (e, dispatch) => {
    dispatch({ type: 'model_categories', payload: e });
    // filters.model_categories = e;
    // filterChange(filters);
}

// const onSearch = (parentSearch, filter) => {
//     parentSearch(filters);
// }

const onRemove = (parentRemove, dispatch) => {
    dispatch({ type: 'clear' });
    parentRemove();
}


export default ModelFilterBar;