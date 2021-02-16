import React from 'react';
import Table from 'react-bootstrap/Table';

import GoodIcon from '../../assets/CalibrationIcons/Good.png';
import WarningIcon from '../../assets/CalibrationIcons/Warning.png';
import ExpiredIcon from '../../assets/CalibrationIcons/Expired.png';
import NaIcon from '../../assets/CalibrationIcons/Non-Calibratable.png';

const calStatusKey = () => {
    return (
        <Table striped bordered hover size="sm">
            <thead>
                <tr>
                    <th colSpan={3}>Status Key</th>
                </tr>
                <tr>
                    <th>Icon</th>
                    <th>Meaning</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><img src={GoodIcon} className='calibration-status-icon' alt="Check Icon" /></td>
                    <td>Expiration is over 30 days away</td>
                </tr>
                <tr>
                    <td><img src={WarningIcon} className='calibration-status-icon' alt="Warning Icon" /></td>
                    <td>Expiration is less than 30 days away</td>
                </tr>
                <tr>
                    <td><img src={ExpiredIcon} className='calibration-status-icon' alt="Expired Icon" /></td>
                    <td>The calibration has expired</td>
                </tr>
                <tr>
                    <td><img src={NaIcon} className='calibration-status-icon' alt="Not Applicable Icon" /></td>
                    <td>The instrument isn't calibratable</td>
                </tr>
            </tbody>
        </Table>
    )
}
export default calStatusKey;