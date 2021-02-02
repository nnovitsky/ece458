import './App.css';

import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import LoginPage from './components/login/LoginPage';
import AdminPage from './components/admin/AdminPage';
import UserProfilePage from './components/user/UserProfilePage';
import ModelTablePage from './components/model/ModelTablePage';
import ModelDetailPage from './components/model/ModelDetailView';
import InstrumentTablePage from './components/instrument/InstrumentTablePage';
import Navigation from './components/Navigation';
import AuthServices from './api/authServices';

const authServices = new AuthServices();

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      displayed_form: '',
      logged_in: localStorage.getItem('token') ? true : false,
      username: ''
    };
  }

  componentDidMount() {
    if (this.state.logged_in) {
      console.log("Logged in")
      authServices.getCurrentUser(localStorage.getItem('token')).then(json => {
        this.setState({ username: json.username });
      });
    }
    else {
      console.log("Not logged in")
    }
  }

  handle_login = (e, data) => {
    e.preventDefault();

    authServices.login(data).then(json => {
      localStorage.setItem('token', json.token);
      this.setState({
        logged_in: true,
        displayed_form: '',
        username: json.username
      });
    });

  };


  render(
    form = <LoginPage handle_login={this.handle_login} />
  ) {
    return (
      <BrowserRouter>
        <div>
          <Navigation logged_in={this.state.logged_in}/>
          <Switch>
            <Route path="/models" component={ModelTablePage} exact />
            <Route path="/models/:pk" component={ModelDetailPage} exact />
            <Route path="/instruments" component={InstrumentTablePage} exact />
            <Route path="/user-profile" component={UserProfilePage} exact />
            <Route path="/admin" component={AdminPage} exact />
          </Switch>
          {this.state.logged_in ? null : form}

        </div>
      </BrowserRouter>
    );
  }
}

export default App;
