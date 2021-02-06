# Django/Backend Guide

## Quick start-up
This is the crude solution for now 
(ultimately hoping to have a single script or something that automates this)

#### start up:
First activate `virtualEnv` (in `ece458/backend`):

`source virtualEnv/bin/Activate` 

To spin up website on local host:

`python3 manage.py runserver`


#### Migrations:


Django automates any changes to our data models by writing the 
SQL code that reflects the changes in the respective database.
These actual files live in `tables/migrations`.

To see the current state of which migrations
have been applied and which haven't:

`python3 manage.py showmigrations`


After making any changes to the data models:

`python3 manage.py makemigrations`


To actually apply the changes:

 `python3 manage.py migrate`

#### Troubleshooting:

If missing python modules (in `ece458/`):

`pip3 install -r requirements.txt` 

OR

`sudo pip3 install -r requirements.txt`

---
If unable to run server check `VIRTUAL_ENV`
and `PYTHONPATH` environmental variables:
 
 `printenv`
 
 If not there or wrong:
 
 `export PYTHONPATH=/path/to/your/project/ece458/`
 
 `export VIRTUAL_ENV=/path/to/your/project/ece458/virtualEnv`
 
 
## Django Admin Credentials
Go to: http://127.0.0.1:8000/admin

Username: admin

Password: guest

