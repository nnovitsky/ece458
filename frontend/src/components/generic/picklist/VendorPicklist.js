import React from 'react';
import ModelServices from '../../../api/modelServices';
import BasePicklist from './BasePicklist';

// selectedVendor: an array of name to pk pairs of the selected categories
// onChange: an event handler that will be passed the array of selected name/pk pairs
function VendorPicklist(props) {
    console.log(props);
    return (
        <BasePicklist
            selectedCategories={props.selectedVendor}
            onFilterChange={props.onChange}
            getOptions={getVendors}
            placeholderText="Vendors..."
            type="string"
        />
    )
}


async function getVendors() {
    const modelServices = new ModelServices();
    return await modelServices.getVendors().then((result) => {
        if (result.success) {
            return result.data.vendors;
        } else {
            return []
        }
    })
}

export default VendorPicklist;