#!/bin/bash

# Script to validate a backup file without changing current database.

# change to your backup server
backupserver="vcm@vcm-18807.vm.duke.edu"

# change to location of backups on your backup server
backuppath="/home/vcm/backups/dev/"

# change to location you'd like to use to store temp restoration files on dev server
restorepath="/home/vcm/"

# change to your db credentials
dbuser="admin_hpt_user"
dbpass="fantasticfour2021!"


listfiles () {
# list existing backup files in each folder
echo -e "\nDAILY BACKUPS (0):"
ssh ${backupserver} "cd ${backuppath}daily/; ls"

echo -e "\nWEEKLY BACKUPS (1):"
ssh ${backupserver} "cd ${backuppath}weekly/; ls"

echo -e "\nMONTHLY BACKUPS (2):"
ssh ${backupserver} "cd ${backuppath}monthly/; ls"
}

selectfolder () {
echo -e
read  -n 1 -p "Input folder containing backup file to validate (0-daily, 1-weekly, 2-monthly, x-quit): " group
echo -e "\n"

# validate folder choice
if [ "$group" = "0" ]; then
folder="daily/"
echo "DAILY BACKUPS: "
ssh ${backupserver} "cd $backuppath$folder; ls"
selectfile
elif [ "$group" = "1" ]; then
folder="weekly/"
echo "WEEKLY BACKUPS: "
ssh ${backupserver} "cd $backuppath$folder; ls"
selectfile
elif [ "$group" = "2" ]; then
folder="monthly/"
echo "MONTHLY BACKUPS: "
ssh ${backupserver} "cd $backuppath$folder; ls"
selectfile
elif [ "$group" = "x" ] || [ "$group" = "X" ]; then
echo "Quitting program."
exit 1
else
echo "Invalid selection, please try again. Press any key to continue... "
read -n 1
selectfolder
fi
}


selectfile () {
echo -e "\n"
read -p "Input name of file to validate (input x to quit): " filename

# validate file name
if  [ "$filename" = "x" ] || [ "$filename" = "X" ]; then
echo "Quitting program."
exit 1
elif ssh ${backupserver} "test -f $backuppath$folder$filename"; then
loadfile
else
echo "Invalid file name, please try again. Press any key to continue..."
read -n 1
selectfile
fi
}

loadfile () {
# get file from backup server
scp ${backupserver}:$backuppath$folder$filename ${restorepath}temp.zip
echo "File loaded."

# unzip
cd $restorepath
unzip -q temp.zip -d temp
cd temp
unzip -q artifacts.zip -d artifacts

# display cal event artifacts in folder
cd artifacts/cal_event_artifacts/
echo -e "\nCalibration event artifacts in backup: \n"
ls

# get name of sql file
cd ${restorepath}temp/
sqlfile="$(find . -name "*.sql")"
sqlfilename="$(basename $sqlfile)"
echo -e "\nSQL file found: "
echo $sqlfilename

# create trial db
PGPASSWORD=${dbpass} createdb -U ${dbuser} -h localhost trial

# populate with backup data
PGPASSWORD=${dbpass} psql --quiet -U ${dbuser} -h localhost -d trial < $sqlfilename > /dev/null 2>&1

#get most recent user login as metric of data recency
date="$(PGPASSWORD=$dbpass psql -U $dbuser -h localhost trial -c "select Max(last_login) from auth_user")"
echo -e "\nMost recent login recorded: "
echo $date

# delete trial db
PGPASSWORD=${dbpass} dropdb -U ${dbuser} -h localhost trial

# delete temp files
cd $restorepath
sudo rm -rf temp
sudo rm temp.zip
echo "Validation complete."
}

listfiles
selectfolder