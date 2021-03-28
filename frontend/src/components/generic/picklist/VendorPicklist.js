import React from 'react';
import ModelServices from '../../../api/modelServices';
import BaseListPicklist from './BaseListPicklist';

// selectedVendor: a string of the selected vendor
// onChange: an event handler that will be passed a string of the newly selected vendor
// isCreatable: optional and defaults to false
function VendorPicklist(props) {
    return (
        <BaseListPicklist
            selectedCategories={props.selectedVendor}
            onFilterChange={props.onChange}
            getOptions={getVendors}
            placeholderText="Vendors..."
            isCreatable={props.isCreatable}
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

VendorPicklist.defaultProps = {
    isCreatable: false
}