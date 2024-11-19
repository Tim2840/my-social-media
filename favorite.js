const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const userPanel = document.querySelector("#user-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
let favoriteUsers = JSON.parse(localStorage.getItem("favUsers"));
//
function renderUserList(items) {
  let rawHTML = "";
  items.forEach((item) => {
    let genIcon = renderGender(item);
    rawHTML += `
      <div class="col-sm-3">  
        <div class="mb-4">
          <div class="card shadow">
            <div class="card-body">
              <img src="${item.avatar}"
                class="card-img-top rounded-circle border border-light-5 d-flex"
                alt="user's avatar" 
                data-id="${item.id}" 
                data-bs-toggle="modal"
                data-bs-target="#user-detail-modal">
              <h5 class="card-title mt-2 text-center">${item.name} ${item.surname}</h5>
              <span class="d-flex justify-content-center align-items-center genAge">${genIcon} ${item.age} yrs</span>
              <div class="footer">
                <div class="d-flex justify-content-center">
                  <button class="btn btn-danger mt-3 mx-auto btn-removeFav" data-id="${item.id}">
                    X
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    `;
  });
  userPanel.innerHTML = rawHTML;
}

//render user info modal
function renderInfoModal(id) {
  let userPic = document.querySelector("#user-modal-avatar");
  let userName = document.querySelector("#user-modal-name");
  let userMail = document.querySelector("#user-modal-email");
  let userBirthday = document.querySelector("#user-modal-birthday");
  let userAge = document.querySelector("#user-modal-age");
  let userRegion = document.querySelector("#user-modal-region");
  axios
    .get(`${INDEX_URL}${id}`)
    .then((response) => {
      let data = response.data;
      userPic.innerHTML = `<img
      src="${data.avatar}"
      alt="user-avatar" class="card-img-top" />`;
      userName.innerText = `${data.name} ${data.surname}`;
      userMail.innerText = `E-mail: ${data.email}`;
      userBirthday.innerText = `Birthday: ${data.birthday}`;
      userAge.innerText = `Age: ${data.age}`;
      userRegion.innerText = `Country: ${data.region}`;
    })
    .catch((err) => console.log(err));
}

//加入最愛清單
function removeFavoriteList(id) {
  if (!favoriteUsers || !favoriteUsers.length) return;
  let itemIndex = favoriteUsers.findIndex((user) => user.id === id);
  if (itemIndex === -1) return;
  favoriteUsers.splice(itemIndex, 1);
  localStorage.setItem("favUsers", JSON.stringify(favoriteUsers));
  renderUserList(favoriteUsers);
}

//card event listener
userPanel.addEventListener("click", function onPanelClicked(event) {
  let target = event.target;
  if (target.tagName === "I" && target.closest(".btn-favorite")) {
    target = target.closest(".btn-favorite");
  }
  let id = Number(target.dataset.id);
  //User Modal
  if (target.matches(".card-img-top")) {
    console.log(id);
    renderInfoModal(id);
  }
  //Remove Favorite
  if (target.matches(".btn-removeFav")) {
    removeFavoriteList(id);
  }
});

//渲染使用者卡片性別
function renderGender(item) {
  if (item.gender === "male") {
    return `<i class="fa-solid fa-mars fa-lg" style="color: #002aff;"></i>`;
  } else {
    return `<i class="fa-solid fa-venus fa-lg" style="color: #ee1111;"></i>`;
  }
}

//渲染最愛名單
if (favoriteUsers.length === 0) {
  userPanel.innerHTML = `<h5>There's no one in your favorite list yet, go add someone now!</h5>`;
} else {
  renderUserList(favoriteUsers);
}
