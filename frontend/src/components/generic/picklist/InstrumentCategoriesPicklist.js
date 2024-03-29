import React from 'react';
import CategoryServices from '../../../api/categoryServices';
import BaseCategoryPicklist from './BasePicklist';

// selectedCategories: an array of name to pk pairs of the selected categories
// onChange: an event handler that will be passed the array of selected name/pk pairs
function InstrumentCategoriesPicklist(props) {
    return (
        <BaseCategoryPicklist
            selectedCategories={props.selectedCategories}
            onChange={props.onChange}
            getOptions={getInstrumentCategories}
            placeholderText="Instrument Categories..."
            displayField="name"
            valueField="pk"
            isMulti={true}
        />
    )
}


async function getInstrumentCategories() {
    let categoryServices = new CategoryServices();
    return await categoryServices.getCategories('instrument', true, 1).then(
        (result) => {
            if (result.success) {
                return result.data.data;
            } else {
                return [];
            }
        }
    )
}

export default InstrumentCategoriesPicklist;