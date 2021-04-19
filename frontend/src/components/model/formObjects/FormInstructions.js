const mytext = <div className="overflow-auto" style={{textAlign: "left", marginBottom: "5px", marginLeft: "4%"}}>
        How to use the form builder:
        <ul>
            <li>Add a new step by clicking <b>[Add a new step]</b> and choose a form element.</li>
            <li>Required fields for an element are denoted by a red asterisk. Optional fields without an asterisk can be left blank. 
                No inputs in the form preview need to be filled out, the preview is just to visualize the form.</li>
            <li>As you add more steps, you can scroll to navigate to earlier and later elements.</li>
            <li>Change the order of your steps by choosing a new step number from the drop down menu.</li>
            <li>Delete a step by clicking <b>[X].</b></li>
            <li>Once you have added all needed steps, click <b>[Submit Changes]</b> to save your input.</li>
        </ul>
        Notes: Min and max inputs can accept scientific notation (ex: 1e-8) but will not save inputs with invalid form.
    </div>


export default mytext