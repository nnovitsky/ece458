import React, { useEffect } from 'react';
import ModelServices from '../../../api/modelServices';
import BasePicklist from './BasePicklist';

// selectedVendor: for this picklist to populate, a vendor needs to be chosen
// selectedModelNumber: a string of the selected model number (can be an empty string)
// onChange: an event handler that will be passed an object of the model number + the model pk

let models = [];
function ModelNumberPicklist(props) {

    useEffect(() => {
        async function fetchData() {
            await await fetchModelNumbers(props.selectedVendor).then(result => {
                models = result;
            })
        };
        fetchData();
    }, [props.selectedVendor]);

    return (
        <BasePicklist
            selectedCategories={props.selectedVendor}
            onChange={props.onChange}
            getOptions={async () => { return models }}
            placeholderText="Model Numbers..."
            type="object"
            displayField="model_number"
            valueField="pk"
            isMulti={false}
            noOptionsMessage={() => 'Select a Vendor'}
        />
    )
}

async function fetchModelNumbers(vendor) {
    console.log('getting model numbers');
    if (vendor === '') {
        return [];
    }
    const modelServices = new ModelServices();
    return await modelServices.getModelByVendor(vendor).then((result) => {
        if (result.success) {
            console.log(result.data);
            return result.data;
        } else {
            return [];
        }
    })
}

export default ModelNumberPicklist;