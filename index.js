import { endpoint, buttonAdd, modalOuter, modalInner, tbody, filterNameInput, filterMonthBirthday, filterForm, resetBtn } from "./libs/element.js";
import { handleClickOutside, destroyPopup, handleEscapeKey, closeModal } from './libs/utils.js';
import { displayPeople } from './libs/display.js';

//Fetch the data from the people.json files
export async function fetchPeople() {
    const response = await fetch(endpoint);
    const data = await response.json();
    let people = data;

    function displayLists() {
        const html = displayPeople(people);
        tbody.innerHTML = html;
    }

    displayLists();
    
   function editandDeleteButtons(e) {
        if (e.target.closest('button.edit')) {
            const tableToEdit = e.target.closest('tr');
            const id = tableToEdit.dataset.id;
            displayEditBtn(id);
        }
        if (e.target.closest('button.delete')) {
            const rowToDelete = e.target.closest('tr');
            const id = rowToDelete.dataset.id;
            displayDeleteBtn(id);
        }
    }

    function displayEditBtn(idToEdit) {
        const findPeople = people.find(people => people.id == idToEdit);
            const popup = document.createElement('form');
            popup.classList.add('popup');
            popup.insertAdjacentHTML('afterbegin', 
            `
                <fieldset>
                    <label for="pictures">Picture</label>
                    <input type="url" id="pictures" name="pictures" value="${findPeople.picture}" required>
                </fieldset>
                <fieldset>
                    <label for="lastName">Last name</label>
                    <input type="text" id="lastName" name="lastName" value="${findPeople.lastName}" required>
                </fieldset>
                <fieldset>
                    <label for="firstName">First name</label>
                    <input type="text" id="firstName" name="firstName" value="${findPeople.firstName}" required>
                </fieldset>
                <fieldset>
                    <label for="birthDay">Days</label>
                    <input type="text" id="birthDay" name="birthDay" value="${findPeople.birthday}" required>
                </fieldset>
                <div class="buttons">
                    <button type="submit" class="submitbtn">Submit</button>
                    <button type="button" class="cancelEdit">Cancel</button>
                </div>
            `);
    
            window.addEventListener('click', e => {
                if (e.target.closest('button.cancelEdit')) {
                    destroyPopup(popup);
                }
            });
    
            window.addEventListener('keydown', e => {
                if (e.key === 'Escape') {
                    destroyPopup(popup);                }
            })
    
            popup.addEventListener('submit', (e) => {
                e.preventDefault();
                
                findPeople.lastName = popup.lastName.value,
                findPeople.firstName = popup.firstName.value,
                findPeople.picture = popup.pictures.value,
                findPeople.birthday = popup.birthDay.value, 

                displayLists(findPeople);
                destroyPopup(popup);
                tbody.dispatchEvent(new CustomEvent('updatedTheList'));
            }, { once: true });
    
            document.body.appendChild(popup);
            popup.classList.add('open');
    };    

    //Html for the delete button
    function displayDeleteBtn(idToDelete) {
        return new Promise(async function(resolve) {
			// First we need to create a popp with all the fields in it
			const delPopup = document.createElement('div');
			delPopup.classList.add('delPopup');
			delPopup.insertAdjacentHTML('afterbegin',
            `	
                <h3>Are you sure that you want to delete this partener ?</h3>
                <div class="deletebtns">
                    <button type="button" class="yes">yes</button>
                    <button type="button" class="cancelDelete">Cancel</button>
                </div>
            `);
            delPopup.classList.add('open');

            window.addEventListener('click', e => {
                const cancelBtn = e.target.closest('button.cancelDelete');
                if (cancelBtn) {
                    destroyPopup(delPopup);
                }

                window.addEventListener('keydown', e => {
                    if (e.key === 'Escape') {
                        destroyPopup(delPopup);                }
                })
    
                const yesBtn = e.target.closest('button.yes');
                if (yesBtn) {
                    const removeLi = people.filter(people => people.id != idToDelete);
                    people = removeLi;
                    displayLists(removeLi);
                    tbody.dispatchEvent(new CustomEvent('updatedTheList'));
                    destroyPopup(delPopup);
                }
            });
           
            document.body.appendChild(delPopup);
            delPopup.classList.add('open');
        });
    }

    const handleNewPeople = () => {
        modalInner.innerHTML =    
        `
        <form action="" class="form_submit">
            <fieldset>
                <label for="picture">Picture</label>
                <input type="url" id="picture" name="picture" required>
            </fieldset>
            <fieldset>
                <label for="lastname">Last name</label>
                <input type="text" id="lastname" name="lastname" required>
            </fieldset>
            <fieldset>
                <label for="firstname">First name</label>
                <input type="text" id="firstname" name="firstname" required>
            </fieldset>
            <fieldset>
                <label for="birthday">Days</label>
                <input type="date" id="birthday" name="birthday" required>
            </fieldset>
            <div class="buttons">
                <button type="submit" class="submit">Submit</button>
            </div>
            </form>
        `;
        modalOuter.classList.add('open');
    }

    // Add new person to the list
    const addNewPeople = (e) => {
        e.preventDefault();
        const form = e.target;
        const newPeople = {
            id: Date.now(),
            picture: form.picture.value,
            lastName: form.lastname.value,
            firstName: form.firstname.value,
            birthday: form.birthday.value,
        }
        people.push(newPeople);
        displayLists(people);
        //Reset the form
        form.reset();
        tbody.dispatchEvent(new CustomEvent('updatedTheList'));
        closeModal();
    }

    const filterPersonByName = () => {
        // Get the value of the input
        const input = filterNameInput.value;
        const inputSearch = input.toLowerCase();
        // Filter the list by the firstname or lastname
        const searchPerson = people.filter(person => person.lastName.toLowerCase().includes(inputSearch) || 
            person.firstName.toLowerCase().includes(inputSearch));
        const myHTML = displayPeople(searchPerson);
        tbody.innerHTML = myHTML;
    }

    // Filter by month
    const filterPersonMonth = e => {
        // Get the value of the select input
        const select = filterMonthBirthday.value;
        const filterPerson = people.filter(person => {
            // Change the month of birth into string
            const getMonthOfBirth = new Date(person.birthday)
            .toLocaleString("en-US", 
            { month: "long" }); 

            // Filter the list by the month of birth
            return getMonthOfBirth.toLowerCase().includes(select.toLowerCase());
        });
        const myHTML = displayPeople(filterPerson);
        tbody.innerHTML = myHTML;
    }

    const resetFilters = e => {
        filterForm.reset();
        displayLists();
    };


    // //To get the items from the local storage
    const initialStorage = () => {
        const lsItems = JSON.parse(localStorage.getItem('people'));
        if (lsItems) {
            people = lsItems;
            displayLists();
        }
        tbody.dispatchEvent(new CustomEvent('updatedTheList'));
    };
    
    // To set the item in the local storage.
    const updateLocalStorage = () => {
        localStorage.setItem('people', JSON.stringify(people));
    };
    
    //************* EVENT LISTENER **********
    buttonAdd.addEventListener('click', handleNewPeople);
    resetBtn.addEventListener('click', resetFilters);
    filterNameInput.addEventListener('keyup', filterPersonByName);
    filterMonthBirthday.addEventListener('change', filterPersonMonth);
    tbody.addEventListener('updatedTheList', updateLocalStorage);
    modalInner.addEventListener('submit', addNewPeople);
    modalOuter.addEventListener('click', handleClickOutside);
    tbody.addEventListener('click', editandDeleteButtons);
    initialStorage();
}
window.addEventListener('keydown', handleEscapeKey);

fetchPeople();