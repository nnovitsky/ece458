# Overview
This project was built using a React client-side frontend that connects to a Django backend with a Postgres Database. This connection is achieved using a RESTful API, allowing the backend to transfer representation of state with JSON to the frontend. The git repository for this project at the top level is broken into a frontend and backend directory.

## High-Level Frontend
The connection to the backend is facilitated through several JavaScript service files. These hit the endpoints established by the backend and return either the data desired or the errors received. On top of these files, are the components. These make up the user interface that presents the product to the user. 

#### Tree structure of frontend directory:

    ├───node_modules: npm dependencies
    └───src
        ├───api: service files that hit the api endpoints from the backend
        ├───assets:  images used on the site
        └───components:  all the page classes and their children components that make up the site
            ├───admin: contains all files relevant to the admin page
            ├───categories: contains all files relevant to the model categories page
            ├───generic: contains components that were built to be generic and reusable
            ├───import: contains components that make up the import page
            ├───instrument: contains components that make up the instrument table page and the instrument detail view page
            ├───login: contains components that makeup the login page
            ├───model: contains components that make up the model table page and the model detail view page
            ├───user: contains all files relevant to the user profile page
            └───wizard: contains components that are used to make the load calibration wizard
            


There is a component class for each page displayed to the user (ex. login page, a model page, etc). This component class is then the culmination of several smaller component functions. With React, best practice includes making components small, function-specific, and ideally reusable.

The frontend app itself is launched from the App.js file. It is here that all of the brower routes are defined. Additionally, every page other than the login are protected routes that can only be accessed with an authentication token. This is acquired when a registered user logs in. Beyond protected routes, there are also admin routes that are only accessible to users who have been granted administrative permissions.

Beyond the service files and the components, the frontend has installed several package dependencies. 

#### Packages used for the frontend (details in package.json):
- bootstrap: frontend toolkit used for formatting the site
- jsonpath: used for navigating json objects with string paths
- prop-types: used to declare default props for components/functions
- react-beforeunload: used for performing functions before a user closes a window
- react-bootstrap-table-next: a package that provides a very versatile and configurable table
- react-bootstrap-table2-paginator: an extension for the bootstrap table next package to allow for remote pagination
- react-datepicker: package that provides a calendar date-picking component, used for calibration dates
- react-router-dom: used for routing within the site and declaring url paths
- react-select: used for a dropdown searchable picklist for assisted input

## High-Level Backend
The backend of the project (contained in ./backend directory) uses Django from the main driver in the backend.hpt directory with a single app, backend.tables. The app contains 3 custom models, ItemModel, Instrument, and CalibrationEvent, in addition to a built-in Django model for User. Fields in models as well as relationships between models are defined below. 

#### Tree structure of backend directory:

    └───backend
        ├───config: data rules defined by specs
        ├───hpt: main project, contains urls, settings, etc. for Django project
        ├───import_export: data validation script for importing/exporting data to csv
        ├───static: static files for deployment build
        └───tables: Django app with models, views, serializers, migration files, and tests for views

#### Packages used for the backend (details in requirements.txt):
- Django: main project framework
- djangorestframework: used to build REST API
- djangorestframework-jwt: used for user authentication to protect endpoints
- django-cors-headers: used to handle request headers 
- django-filter: used for custom filtering on search endpoints for database
- reportlab: used to generate calibration certificate PDF
- pandas: used to handle import/export with csv format


#### Database Schema
The database for this project is set up with 4 related tables: models, instruments, calibration events, and users. 

![DB Diagram](db_diagram.png)
