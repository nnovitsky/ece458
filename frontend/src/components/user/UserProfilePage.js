import React from 'react';
import './UserProfilePage.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';


class user extends React.Component {
    render() {
        return (
            <div className="background">
                <div className="row mainContent">
                    <div className="col-2 text-center">
                        <img src={logo} alt="Logo" />
                    </div>
                    <div className="col-10">
                        <h2>Hello, User</h2>
                        <button>Change Display Name</button>
                        <button>Change Email</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default user;