    // JavaScript code for form validation
    
    // Retrieve the input field value
    let inputField = document.getElementById("inputField");

    let myform = document.getElementById("myForm");
    myform.addEventListener("submit", function(evt) {
        // Prevent form from submitting
        evt.preventDefault();

        // Regular expression pattern for alphanumeric input
        let pattern = /^[a-zA-Z0-9]+$/;

        // Check if the input value matches the pattern
        if (pattern.test(inputField.value)) {
        // Valid input: display confirmation and submit the form
            alert("Form submitted successfully!");
            inputField.value = "";   // Clear input field after submission
        } else {
        // Invalid input: display error message
            alert("Error: Input must be alphanumeric!");
        }

});