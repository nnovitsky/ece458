import React from 'react';
import BasePicklist from './BaseListPicklist';

// selectedCategories: an array of name to pk pairs of the selected categories
// onChange: an event handler that will be passed the array of selected name/pk pairs
function PriviledgePicklist(props) {
    return (
        <BasePicklist
            selectedCategories={props.selectedCategories}
            onChange={props.onChange}
            getOptions={getTypesPrivilege}
            placeholderText="Privledges..."
            type="object"
            displayField="name"
            valueField="pk"
            isMulti={true}
        />
    )
}

async function getTypesPrivilege(){
    return ['admin', 'oauth']
}

/* async function getModelCategories() {
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
} */

export default PriviledgePicklist;