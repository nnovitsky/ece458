import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import ModelServices from '../../../api/modelServices';
import { CalibrationModeDisplayMap } from '../Util';

// selectedMode: a string of the selected calibration mode
// onChange: an event handler that will be passed the new calibration mode
function CalModePicklist(props) {
    const [allOptions, setAllOptions] = useState(null);
    useEffect(() => {
        async function fetchData() {
            let result = await getCalModes();
            setAllOptions(result);
            console.log(result);
        }
        if (!allOptions) {
            fetchData();
        }
    }, [allOptions]);

    return (
        <Select
            value={mapStringToObject(props.selectedMode)}
            options={allOptions}
            isSearchable={false}
            onChange={(mode) => { props.onChange(mode.value) }}
            placeholder="Calibration Mode..."
            isMulti={false}
        />
    )
}

function mapArrayToObject(input) {
    let result = [];
    input.forEach(element => {
        let display = CalibrationModeDisplayMap[element];
        result.push({
            "label": display,
            "value": element,

        })
    });
    return result;
}

function mapStringToObject(input) {
    return {
        "label": CalibrationModeDisplayMap[input],
        "value": input,
    }
}


const getCalModes = async () => {
    // let result = [
    //     "regular",
    //     "load_bank"
    // ];
    const modelServices = new ModelServices();
    return await modelServices.getCalModes().then((result) => {
        if (result.success) {
            return mapArrayToObject(result.data.modes);
        } else {
            return [];
        }
    })

    // let categoryServices = new CategoryServices();
    // return await categoryServices.getCategories('model', true, 1).then(
    //     (result) => {
    //         if (result.success) {
    //             return result.data.data;
    //         } else {
    //             return [];
    //         }
    //     }
    // )
}

export default CalModePicklist;