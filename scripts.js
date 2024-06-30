
const tabs = document.querySelectorAll('[data-tab-target]')
const tabContents = document.querySelectorAll('[data-tab-content]')
const todoListElement = document.getElementById("todo-list")
const addTodoButton = document.getElementById("add-todo-button");
const todoFormContainer = document.getElementById("hidden-container")
const addTodoForm = document.getElementById("add-todo-form");
const submitTodoButton = document.getElementById("submit-todo");
const todos = []; 


// open form for adding an item to the list
addTodoButton.addEventListener("click", function() {
    todoFormContainer.classList.toggle("hidden");  // Toggle visibility
    document.getElementById("new-todo-text").value = "";  // Clear name input
    document.getElementById("todo-details").value = "";  // Clear description input
   });

// fetch dummy todo items
async function getTempTodoItems() {
    const response = await fetch('https://dummyjson.com/todos/random/4');
    console.log("getting temp items")
    // Check for successful response
    if (!response.ok) {
      console.error("Error fetching data:", response.status);
      return;  // Exit the function if there's an error
    }
    const data = await response.json();
    console.log(data)
    for (let i = 0; i < data.length; i++) {

        const uniqueId = crypto.randomUUID()
        const todoItem = {
        id: uniqueId,
        taskName: data[i].todo,
        taskDescription: "lorem",  // Assuming default description for now
        status: data[i].completed ? "completed" : "pending"
        };
        todos.push(todoItem);  // Add the created todo item to the todos array
      
        // Store all todo items at once (more efficient)
        localStorage.setItem("todos", JSON.stringify(todos));
    }
    displayTodosFromLocalStorage()
  }




submitTodoButton.addEventListener("click", function(event) {
    event.preventDefault();
    
    const name = document.getElementById("new-todo-text").value;
    const description = document.getElementById("todo-details").value;
    const uniqueId = crypto.randomUUID()
    // Create a to-do item object
    const todoItem = {
      id:uniqueId,
      taskName: name,
      taskDescription: description,
      status: "pending"
    };

    // Store the to-do item in local storage
    // localStorage.setItem("todos", JSON.stringify(todoItem));  // Convert to JSON string
    appendToLocalStorage("todos", todoItem)
  
    // Clear input fields after successful submission (optional)
    document.getElementById("new-todo-text").value = "";
    document.getElementById("todo-details").value = "";
    todoFormContainer.classList.toggle("hidden")
    displayTodosFromLocalStorage()
 
  });

function appendToLocalStorage(key, newObject) {
    const existingData = localStorage.getItem(key);
    let data;
  
    if (existingData) {
      // Parse existing data if it exists
      try {
        data = JSON.parse(existingData);
      } catch (error) {
        console.error("Error parsing existing data:", error);
        // Handle potential parsing errors (corrupted data or invalid JSON format)
        return;  // Exit if parsing fails
      }
    } else {
      // Initialize data as an empty array if nothing is stored yet
      data = [];
    }
  
    // Ensure data is an array (handle potential type mismatches)
    if (!Array.isArray(data)) {
      console.error("Expected data to be an array, but found:", typeof data);
      return;  // Exit if data is not an array
    }
  
    // Append the new object to the array
    data.push(newObject);
  
    // Store the modified data (as JSON string)
    localStorage.setItem(key, JSON.stringify(data));
  }



function displayTodosFromLocalStorage() {
    const storedTodos = localStorage.getItem("todos");
    if (!storedTodos) {
        console.log("no storage")
        getTempTodoItems() // get temp items
    }
  
    const todoItems = JSON.parse(storedTodos);
    // console.log(todoItems)
    if (todoItems.length == 0) {
      console.log("empty storage")
      getTempTodoItems() // get temp items
    }
  
    const todoList = document.getElementById("todo-list");  // Assuming you have an element with this ID
    todoList.innerHTML = ``;
for (const item of todoItems) {
  console.log(item.id);
  const task = `
    <div class="task ${item.status == "completed" ? "finished" : ""}" id=${item.id}>
      <input type="checkbox" id="${item.taskName}" name="${item.id}" value="${item.taskName}" ${item.status === "completed" ? "checked" : ""}>
      <input type="text" class="taskName no-select" value="${item.taskName}" for="${item.id}" readonly>
      <button class="edit">
          <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button class="delete">
          <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `;
  todoList.innerHTML += task;
}
document.querySelectorAll('.taskName').forEach(textInput => {
  textInput.addEventListener('click', () => {
    // completed task
    
    const checkbox = textInput.previousElementSibling;
    // update check
    
    updateCheckedClass(checkbox);

  });

  textInput.addEventListener('copy', (e) => {
    e.preventDefault();
  });
});

    // Adding event listeners for checkboxes to sync with the .checked class
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        updateCheckedClass(checkbox);
      });
    });
    const deleteButtons = document.querySelectorAll(".delete")

    // delete functionality
    deleteButtons.forEach((button)=>{
      button.addEventListener('click', ()=>{
        
        const todoItem = button.parentNode

        console.log(`trying to delete item`, todoItem.id)
      
        deleteTodoFromLocalStorage(todoItem.id)
        button.parentNode.remove();
        
      })
    })
    const editButtons = document.querySelectorAll(".edit")

    // edit functionality
    editButtons.forEach((button)=>{
      button.addEventListener('click', ()=>{
        const todoItem = button.parentNode;
        const textInput = todoItem.querySelector('.taskName');
        // console.log(textInput)
        console.log(`trying to edit item`, textInput.value)
        console.log(button.innerHTML)
        const icon = button.querySelector('i');

        if (icon.classList.contains('fa-pen-to-square')) {
          // Enable editing of the text input
          textInput.readOnly = false;
          textInput.classList.remove('no-select');
    
          // Change icon to save
          icon.classList.remove('fa-pen-to-square');
          icon.classList.add('fa-check');
    
          // Optionally, set focus and move cursor to the end of the text
          textInput.focus();
          textInput.setSelectionRange(textInput.value.length, textInput.value.length);
        } else {
          // Save changes and disable editing of the text input
          textInput.readOnly = true;
          textInput.classList.add('no-select');
    
          // Change icon back to edit
          icon.classList.remove('fa-check');
          icon.classList.add('fa-pen-to-square');
          editTodoFromLocalStorage(todoItem.id,textInput.value)
        }


      })
    })
  }


  
  // Call the displayTodosFromLocalStorage function when needed (e.g., on page load)
  displayTodosFromLocalStorage();

  function updateCheckedClass(checkbox) {
    checkbox.checked = !checkbox.checked;
    const taskDiv = checkbox.parentElement;

      
      taskDiv.classList.toggle("finished")
    const isFinished = checkbox.checkbox? "pending": "completed"
    editFinishedFromLocalStorage(taskDiv.id, isFinished)
      // taskDiv.classList;


  }

// removing from local storage
function deleteTodoFromLocalStorage(id) {
  const storedTodos = localStorage.getItem("todos");
  if (!storedTodos) {
    return;  // No data stored, nothing to delete
  }

  const todoItems = JSON.parse(storedTodos);
  console.log(`before filter`,todoItems)

  // Filter items based on taskName (strict comparison)
  const filteredItems = todoItems.filter((item) => item.id != id);
console.log(`after filter`,filteredItems)
  // Check if item was found (optional)
  if (filteredItems.length === todoItems.length) {
    console.warn("Item with taskName:", taskName, "not found in local storage");
  }

  // Store the filtered data
  localStorage.setItem("todos", JSON.stringify(filteredItems));

  // Update UI to reflect the deletion (see next step)
}
// editing item in local storage
function editTodoFromLocalStorage(id, newVal) {
  const storedTodos = localStorage.getItem("todos");
  if (!storedTodos) {
    return;  // No data stored, nothing to update
  }

  const todoItems = JSON.parse(storedTodos);

  // Update the task name for the given id
  const updatedItems = todoItems.map((item) => {
    if (item.id == id) {
      return { ...item, taskName: newVal };
    }
    return item;
  });

  // Store the updated data
  localStorage.setItem("todos", JSON.stringify(updatedItems));
  // Update UI to reflect the deletion (see next step)
}

// editing item in local storage
function editFinishedFromLocalStorage(id, newVal) {
  const storedTodos = localStorage.getItem("todos");
  if (!storedTodos) {
    return;  // No data stored, nothing to update
  }

  const todoItems = JSON.parse(storedTodos);

  // Update the task name for the given id
  const updatedItems = todoItems.map((item) => {
    if (item.id == id) {
      return { ...item, status: newVal };
    }
    return item;
  });

  // Store the updated data
  localStorage.setItem("todos", JSON.stringify(updatedItems));
  // Update UI to reflect the deletion (see next step)
}
const submitMailButton = document.getElementById("submit-mail")
submitMailButton.addEventListener('click',(e)=>{
  e.preventDefault()
  const userName = document.querySelector("#name").value;
  const userEmail = document.querySelector("#email").value;
  const message = document.querySelector("#message").value;
  if (userName != "" && userEmail != "" && message!= "") {
    sendEmail(userName,email,message)
    // console.log("sent mail :")
    // alert("email sent")
  }else{
    alert("something went wrong")
  }
})


function sendEmail(userName, email, message){
  let params = {
    from_name: userName,
    email_id: email,
    message: message

  }
  emailjs.send("service_a7jr5kc", "template_fwh9mep", params).then(function (res){
    alert("email Sent successfully");
  })
}

// tabs functionality
tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
        const target = document.querySelector(tab.dataset.tabTarget)

        tabContents.forEach(tabContent =>{
            tabContent.classList.remove('active')
        })
        tabs.forEach(tab => {
            tab.classList.remove('active')
        })
        tab.classList.add('active')
        target.classList.add('active')
    })
})
