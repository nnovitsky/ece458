import React from 'react';
import { useHistory, useParams } from "react-router-dom";

let history;
let key;


const ModelDetailView = () => {
    let { pk } = useParams();
    history = useHistory();
    key = pk;
    return (
        <div>
            <h1>Model Detail View</h1>
            <p>{key}</p>
        </div>
    );
}

export default ModelDetailView;