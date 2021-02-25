import './App.css';

import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import LoginPage from './components/login/LoginPage';
import AdminPage from './components/admin/AdminPage';
import UserProfilePage from './components/user/UserProfilePage';
import ImportPage from './components/import/ImportPage';
import ModelTablePage from './components/model/ModelTablePage';
import ModelDetailPage from './components/model/ModelDetailView';
import InstrumentTablePage from './components/instrument/InstrumentTablePage';
import InstrumentDetailView from './components/instrument/InstrumentDetailView';
import CategoriesPage from './components/categories/CategoriesPage';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import AuthServices from './api/authServices';
const authServices = new AuthServices();

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      logged_in: localStorage.getItem('token') ? true : false,
      username: '',
      error_message: '',
      admin: false,
      redirect: null
    };
  }

  componentDidMount() {
    if (this.state.logged_in) {
      authServices.getCurrentUser().then((result) => {
        if (result.success) {
          this.setState({ 
            username: result.data.username,
            admin: result.data.is_staff,
          })
        } else {
          localStorage.removeItem('token');
          this.setState({
            logged_in: false,
            username: '',
            admin: false
          });
        }
    }
    )
    }
    else {
      console.log("Not Logged in")
    }
  }

  handle_login = (e, data) => {
    if (data.username === "" || data.password === "") {
      this.setState({ error_message: 'Please complete all fields' });
    }
    else {
      e.preventDefault();
      authServices.login(data)
        .then(res => res.json())
        .then(json => {
          if (typeof json.user === 'undefined') {
            console.log(json)
            this.setState({ error_message: 'Incorrect Login Credentials' });
          }
          else {
            localStorage.setItem('token', json.token);
            this.setState({
              logged_in: true,
              username: json.user.username,
              admin: json.user.is_staff,
              redirect: true
            });
            this.setState({ error_message: '' });
          }
        });
    }
  };


  handle_logout = () => {
    localStorage.removeItem('token');
    this.setState({ 
      logged_in: false, 
      username: '',
      admin: false,
      redirect: false
   });
  };



  render(
    form = <LoginPage handle_login={this.handle_login} error_message={this.state.error_message} isLoggedIn={this.state.logged_in}/>,
  ) {
    return (
      <BrowserRouter>
        <div>
          <Navigation logged_in={this.state.logged_in} handle_logout={this.handle_logout} is_admin={this.state.admin} user={this.state.username}/>
          <Switch>
            <ProtectedRoute path="/models" component={ModelTablePage} is_admin={this.state.admin} exact />
            <ProtectedRoute path="/models/:pk" component={ModelDetailPage} is_admin={this.state.admin} exact />
            <ProtectedRoute path="/instruments" component={InstrumentTablePage} is_admin={this.state.admin} exact />
            <ProtectedRoute path="/instruments/:pk" component={InstrumentDetailView} is_admin={this.state.admin} exact />
            <AdminRoute is_admin={this.state.admin} path="/import" component={ImportPage} exact />
            <ProtectedRoute path="/user-profile" component={UserProfilePage} exact />
            <AdminRoute is_admin={this.state.admin} path="/admin" component={AdminPage} exact />
            <AdminRoute is_admin={this.state.admin} path="/categories" component={CategoriesPage} exact />
          </Switch>
          {this.state.logged_in ? null : form}
          {this.state.redirect ? (<Redirect to="/user-profile"/>) : null}
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
