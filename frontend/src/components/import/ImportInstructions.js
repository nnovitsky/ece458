const mytext = <div className="overflow-auto"> <p><b>Model Import Guidelines:</b><br></br>
Please upload a “.csv” file that contains the following seven headers located in the first row:
<ul>
<li>Vendor</li>
<li>Model-Number</li>
<li>Short-Description</li>
<li>Comment</li>
<li>Model-Categories</li>
<li>Load-Bank-Support</li>
<li>Calibration-Frequency</li>
</ul>
All subsequent rows must contain the appropriate information that falls under the correct column and corresponds to the desired models to upload. Every field is required except for those that fall under the ‘Comment’ column. A model that does not require calibration should have a ‘N/A’ as its calibration frequency. 
All fields are case-sensitive; models and model categories with different capitalization will be considered different items. Uploaded models that have already been uploaded to the system will cause an upload error. Model categories that do not exist will be created upon import. Failure to adhere to these format requirements will result in a failed upload.
<br></br>
<br></br>
<br></br>
<b>Instrument Import Guidelines:</b>
<br></br>
Please upload a “.csv” file that contains the following eight headers located in the first row:
<ul>
    <li>Vendor</li>
    <li>Model-Number</li>
    <li>Serial-Number</li>
    <li>Asset-Tag</li>
    <li>Comment</li>
    <li>Calibration-Date</li>
    <li>Calibration-Comment</li>
    <li>Instrument-Categories</li>
</ul> 
All subsequent rows must contain the appropriate information that falls under the correct column and corresponds to the desired instruments to upload. Cells that are within the ‘Comment’ and ‘Calibration-Comment’ headers are optional. Cells that fall underneath the ‘Calibration-Date’ may only be left blank if the instrument does not require calibration. ‘Calibration-Date’ cells must adhere to the ‘MM-DD-YYYY’ date format. 
The corresponding model to an uploaded instrument must already exist within the inventory system. Uploaded instruments that have already been uploaded to the system will cause an upload error. Instrument categories that do not exist will be created upon import
All fields are case-sensitive; instruments and instrument categories with different capitalization will be considered different items. Failure to adhere to these format requirements will result in a failed upload.</p>
</div>

export default mytext