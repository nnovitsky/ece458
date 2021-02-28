import React from 'react';
import CategoryServices from '../../../api/categoryServices';
import BasePicklist from './BasePicklist';

// selectedCategories: an array of name to pk pairs of the selected categories
// onChange: an event handler that will be passed the array of selected name/pk pairs
function ModelCategoriesPicklist(props) {
    return (
        <BasePicklist
            selectedCategories={props.selectedCategories}
            onFilterChange={props.onChange}
            getOptions={getModelCategories}
            placeholderText="Model Categories..."
            type="object"
            displayField="name"
            valueField="pk"
            isMulti={true}
        />
    )
}


async function getModelCategories() {
    let categoryServices = new CategoryServices();
    return await categoryServices.getCategories('model', true, 1).then(
        (result) => {
            if (result.success) {
                return result.data.data;
            } else {
                return [];
            }
        }
    )
}

export default ModelCategoriesPicklist;