import React from 'react';
import ModelServices from '../../../api/modelServices';
import BaseListPicklist from './BaseListPicklist';

// selectedVendor: an array of name to pk pairs of the selected categories
// onChange: an event handler that will be passed the array of selected name/pk pairs
function VendorPicklist(props) {
    return (
        <BaseListPicklist
            selectedCategories={props.selectedVendor}
            onFilterChange={props.onChange}
            getOptions={getVendors}
            placeholderText="Vendors..."
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