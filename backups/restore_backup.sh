#!/bin/bash

# Script to restore a backup from backup server. (Indenting format flat here for optimal behavior when copy-pasted, shell will auto-add necessary formatting.)

# change to your backup server
backupserver="vcm@vcm-18807.vm.duke.edu"

# change to location of backups on your backup server
backuppath="/home/vcm/backups/prod/"

# change to location of cal event artifacts on your dev server
artifactpath="/home/vcm/evo1/ece458/backend/media/"

# change to location you'd like to use to store temp restoration files on dev server
restorepath="/home/vcm/"

# change to your db credentials
dbuser="admin_hpt_user"
dbpass="fantasticfour2021!"
dbname="evolution_two"

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
read  -n 1 -p "Input desired backup folder (0-daily, 1-weekly, 2-monthly, x-quit): " group
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
read -p "Input name of file to use for restoration (input x to quit): " filename

# validate file name
if  [ "$filename" = "x" ] || [ "$filename" = "X" ]; then
echo "Quitting program."
exit 1
elif ssh ${backupserver} "test -f $backuppath$folder$filename"; then
verify
else
echo "Invalid file name, please try again. Press any key to continue..."
read -n 1
selectfile
fi
}

verify () {
read -p "Are you sure you want to overwrite existing database and saved calibration artifacts with backup $filename? Enter y to proceed, n to choose another backup, x to quit: " choice
if [ "$choice" = "y" ] || [ "$choice" = "Y" ]; then
loadfile
elif [ "$choice" = "n" ] || [ "$choice" = "N" ]; then
selectfile
elif [ "$choice" = "x" ] || [ "$choice" = "X" ]; then
echo "Quitting program."
exit 1
else
echo "Invalid response, please try again. Press any key to continue... "
read -n 1
verify
fi
}

loadfile () {
# get file from backup server
scp ${backupserver}:$backuppath$folder$filename ${restorepath}temp.zip
echo "File loaded."

# unzip
cd $restorepath
unzip temp.zip -d temp
cd temp
unzip artifacts.zip -d artifacts

# replace existing cal event artifacts
cd artifacts
sudo rm -rf ${artifactpath}cal_event_artifacts
sudo mv -f cal_event_artifacts ${artifactpath}

# get name of sql file
cd ${restorepath}temp/
sqlfile="$(find . -name "*.sql")"
sqlfilename="$(basename $sqlfile)"
echo $sqlfilename

# database restoration
PGPASSWORD=${dbpass} psql -U ${dbuser} -h localhost -d ${dbname} < $sqlfilename

# delete temp files
cd $restorepath
sudo rm -rf temp
sudo rm temp.zip
echo "Restoration complete."
}

listfiles
selectfolder