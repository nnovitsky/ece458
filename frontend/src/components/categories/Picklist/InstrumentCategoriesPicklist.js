import React from 'react';
import CategoryServices from '../../../api/categoryServices';
import BaseCategoryPicklist from './BaseCategoryPicklist';

// selectedCategories: an array of name to pk pairs of the selected categories
// onFilterChange: an event handler that will be passed the array of selected name/pk pairs
function InstrumentCategoriesPicklist(props) {
    return (
        <BaseCategoryPicklist
            selectedCategories={props.selectedCategories}
            onFilterChange={props.onFilterChange}
            getCategories={getInstrumentCategories}
            placeholderText="Instrument Categories..."
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