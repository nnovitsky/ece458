const mytext = <div className="overflow-auto"> <p><b>Model Import Guidelines:</b><br></br>
Please upload a “.csv” file that contains the following five headers located in the first row: 
<ul>
<li>Vendor</li>
<li>Model-Number</li>
<li>Short-Description</li>
<li>Comment</li>
<li>Calibration-Frequency</li>
</ul>
All subsequent rows must contain the appropriate information that falls under the correct column and corresponds to the desired models to upload. Every field is required except for those that fall under the ‘Comment’ column. A model that does not require calibration should have a ‘N/A’ as its calibration frequency. 
All fields are case-sensitive; models with different capitalization will be considered different models. Uploaded models that have already been uploaded to the system will cause an upload error. Failure to adhere to these format requirements will result in a failed upload.
<br></br>
<br></br>
<br></br>
<b>Instrument Import Guidelines:</b>
<br></br>
Please upload a “.csv” file that contains the following six headers located in the first row: 
<ul>
    <li>Vendor</li>
    <li>Model-Number</li>
    <li>Serial-Number</li>
    <li>Comment</li>
    <li>Calibration-Date</li>
    <li>Calibration-Comment</li>
</ul> 
All subsequent rows must contain the appropriate information that falls under the correct column and corresponds to the desired instruments to upload. Cells that are within the ‘Comment’ and ‘Calibration-Comment’ headers are optional. Cells that fall underneath the ‘Calibration-Date’ may only be left blank if the instrument does not require calibration. ‘Calibration-Date’ cells must adhere to the ‘MM-DD-YYYY’ date format. 
The corresponding model to an uploaded instrument must already exist within the inventory system. Uploaded instruments that have already been uploaded to the system will cause an upload error. 
All fields are case-sensitive; instruments with different capitalization will be considered different instruments. Failure to adhere to these format requirements will result in a failed upload.</p>
</div>

export default mytext