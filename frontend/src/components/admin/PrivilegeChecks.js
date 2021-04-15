import React from 'react';
import Form from 'react-bootstrap/Form';
import './Admin.css';


const privilegeChecks = (props) => {
    let adminCheck = props.groups.includes("admin");
    let modelCheck = props.groups.includes("models");
    let instrumentCheck = props.groups.includes("instruments");
    let caliCheck = props.groups.includes("calibrations")
    let approvalCheck = props.groups.includes("calibration_approver")

    return (
        <div className="check-div">
            <Form>
                <Form.Group className="form-inline">
                    <Form.Check style={{marginTop: "10px"}} className="col-sm" id={'admin'+ props.pk} name="admin" label="Admin" type="checkbox" onChange={(privilege) => { props.onChange(mapObjectToArray(privilege, props.pk, props.groups)) }} checked={adminCheck}></Form.Check>
                    <Form.Check style={{marginTop: "10px"}} className="col-sm" id={'models' + props.pk} name="models" disabled={adminCheck} label="Model" type="checkbox" onChange={(privilege) => { props.onChange(mapObjectToArray(privilege, props.pk, props.groups)) }} checked={modelCheck}></Form.Check>
                    <Form.Check style={{marginTop: "10px"}} className="col-sm" id={'instruments' + props.pk} name="instruments" disabled={adminCheck || modelCheck} label="Instrument" type="checkbox" onChange={(privilege) => { props.onChange(mapObjectToArray(privilege, props.pk, props.groups)) }} checked={instrumentCheck}></Form.Check>
                    <Form.Check style={{marginTop: "10px"}} className="col-sm" id={'calibration_approver'+ props.pk} name="calibration_approver" disabled={adminCheck} label="Cal. Approval" type="checkbox" onChange={(privilege) => { props.onChange(mapObjectToArray(privilege, props.pk, props.groups)) }} checked={approvalCheck}></Form.Check>
                    <Form.Check style={{marginTop: "10px"}} className="col-sm" id={'calibrations'+ props.pk} name="calibrations" disabled={adminCheck || approvalCheck} label="Calibration" type="checkbox" onChange={(privilege) => { props.onChange(mapObjectToArray(privilege, props.pk, props.groups)) }} checked={caliCheck}></Form.Check>
                </Form.Group>
            </Form>
        </div>
    )
}


function mapObjectToArray(privilege, pk, oldGroups) {
    let result = {
        pk: pk,
        groups: [],
    };

    oldGroups.forEach(element => {
        if (element === privilege.target.name) {
            if (privilege.target.checked) { result.groups.push(element) }
        }
        else {
            result.groups.push(element)
        }
    });

    if (privilege.target.checked && !oldGroups.includes(privilege.target.name)) {
        result.groups.push(privilege.target.name)
    }

    console.log(result)
    return result;
}


export default privilegeChecks;