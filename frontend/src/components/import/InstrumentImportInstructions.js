const mytext = <div className="overflow-auto"> <p>
<b>Instrument Import Guidelines:</b>
<br></br>
Please upload a “.csv” file that contains the following eight headers located in the first row:
<ul>
    <li>Vendor</li>
    <li>Model-Number</li>
    <li>Serial-Number</li>
    <li>Asset-Tag-Number</li>
    <li>Comment</li>
    <li>Calibration-Date</li>
    <li>Calibration-Comment</li>
    <li>Instrument-Categories</li>
</ul> 
All subsequent rows must contain the appropriate information that falls under the correct column and corresponds to the desired instruments to upload. Cells that are within the ‘Comment’ and ‘Calibration-Comment’ headers are optional. Cells that fall underneath the ‘Calibration-Date’ may only be left blank if the instrument does not require calibration. ‘Calibration-Date’ cells must adhere to the ‘MM-DD-YYYY’ date format. 
The corresponding model to an uploaded instrument must already exist within the inventory system. Uploaded instruments that have already been uploaded to the system will cause an upload error. Instrument categories that do not exist will be created upon import.
All fields are case-sensitive; instruments and instrument categories with different capitalization will be considered different items. Failure to adhere to these format requirements will result in a failed upload.</p>
</div>

export default mytext