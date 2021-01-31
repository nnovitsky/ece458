# read me

## Quick start
Per [this medium article](https://medium.com/@sostomc011/https-medium-com-sostomc011-getting-started-with-django-mysql-and-react-js-backend-b962a7691486), ensure that you have newest version of python3 (should be >= 3.7.x) as well as pip3 installed (don't think the version is as important). For mac people (sorry Natalie): 
`python3 --version`
`pip3 --version`

Can start the virtual environment with 
`source virtualEnv/bin/activate`
and then `deactivate` to turn it off

For updating Python:
`brew install python3`

Getting pip3:
`brew install pip3`


## Get Django started
After activating, within the project run `pip3 install django`

Then run the first migrations: `python3 manage.py migrate`

Then actually run the server that we put into our browser: 
`python3 manage.py runserver`

## Get React started 
You can install Yarn or do this with npm
Install yarn: `sudo npm install --global yarn`

Sorry Natalie, I don't know how to install yarn on Windows!

Enter the frotend folder: `cd frontend`

Start the server two ways: `yarn start` or `npm start`

Open the page on localhost: http://localhost:3000 

