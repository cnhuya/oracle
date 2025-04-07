const button = document.getElementById("myButton");
const outputDiv = document.getElementById("output");

button.addEventListener("click", async function() {
    outputDiv.innerHTML = "Running...";

    try {
        const response = await fetch('http://localhost:3000/view-ohcl'); // Change port if necessary
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();

        if (responseData && responseData.data && responseData.data.length > 0) {
            const firstItem = responseData.data[0];
            outputDiv.innerHTML = `Timestamp: ${firstItem.timespan}<br>Open: ${firstItem.o}<br>Close: ${firstItem.c}<br>High: ${firstItem.h}<br>Low: ${firstItem.l}`;
        }
        else
        {
         outputDiv.innerHTML = "Error: data not found";
         console.error("Invalid data received:", responseData);
        }

    } catch(error){
        outputDiv.innerHTML = "Error:" + error;
        console.error(error);
    }
});