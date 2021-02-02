import React from 'react';
import './Admin.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';

class admin extends React.Component {
    render() {
        return (
            <div className="column-div">
                <div className="left-column">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="main-div">
                    <h2>Hello, Admin</h2>
                    <button>Add New User</button>
                </div>
            </div>


        );
    }
}

export default admin;