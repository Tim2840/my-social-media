const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const userPanel = document.querySelector("#user-panel");
const FavBtn = document.querySelector("#user-favorite-button");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const users = [];
let favoriteUsers = JSON.parse(localStorage.getItem("favUsers")) || [];
let filteredUsers = [];
const USERS_PER_PAGE = 20;

//
function renderUserList(items) {
  let rawHTML = "";
  items.forEach((item) => {
    let genIcon = renderGender(item);
    let hearIcon = isFav(item.id);
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
              <span class="d-flex justify-content-center align-items-center genAge">${genIcon}  ${item.age} yrs</span>
              <div class="footer">
                <div class="d-flex justify-content-center">
                    <button class="btn btn-danger mt-3 mx-auto rounded-circle btn-favorite" data-id="${item.id}">
                      ${hearIcon}
                    </button>
                  </div>
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

//渲染性別
function renderGender(item) {
  if (item.gender === "male") {
    return `<i class="fa-solid fa-mars fa-lg" style="color: #002aff;"></i>`;
  } else {
    return `<i class="fa-solid fa-venus fa-lg" style="color: #ee1111;"></i>`;
  }
}

//渲染每個分頁users
function getUsersByPage(page) {
  let data = filteredUsers.length ? filteredUsers : users;
  let startIndex = (page - 1) * USERS_PER_PAGE;
  let perPageUsers = data.slice(startIndex, startIndex + USERS_PER_PAGE);
  renderUserList(perPageUsers);
}

//增加分頁器
function addPaginator(amount) {
  let totalPages = Math.ceil(amount / USERS_PER_PAGE);
  let rawHTML = "";
  for (page = 1; page <= totalPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
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

//加入最愛
function addToFavoriteList(id) {
  const list = JSON.parse(localStorage.getItem("favUsers")) || [];
  const favUser = users.find((user) => user.id === id);
  list.push(favUser);
  localStorage.setItem("favUsers", JSON.stringify(list));
}

//移除最愛
function removeFavoriteList(id) {
  let favoriteUsers = JSON.parse(localStorage.getItem("favUsers")) || [];
  if (!favoriteUsers || !favoriteUsers.length) return;
  let itemIndex = favoriteUsers.findIndex((user) => user.id === id);
  if (itemIndex === -1) return;
  favoriteUsers.splice(itemIndex, 1);
  localStorage.setItem("favUsers", JSON.stringify(favoriteUsers));
}

//判斷是否在最愛名單
function isFav(id) {
  let icon = favoriteUsers.some((user) => user.id === id)
    ? `<i class="fa-solid fa-heart"></i>`
    : `<i class="fa-regular fa-heart"></i>`;
  return icon;
}

//渲染使用者卡片
axios
  .get(INDEX_URL)
  .then((response) => {
    const results = response.data.results;
    console.log(results);
    users.push(...results);
    getUsersByPage(1);
    addPaginator(users.length);
  })
  .catch((err) => console.log(err));

//使用者卡片事件監聽
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
  //Favorite
  if (target.matches(".btn-favorite")) {
    let favoriteUsers = JSON.parse(localStorage.getItem("favUsers")) || [];
    if (favoriteUsers.some((user) => user.id === id)) {
      removeFavoriteList(id);
    } else {
      addToFavoriteList(id);
    }
    let heartIcon = target.querySelector("i");
    heartIcon.classList.toggle("fa-regular");
    heartIcon.classList.toggle("fa-solid");
  }
});

//監聽搜尋鈕
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  let keyword = searchInput.value.trim().toLowerCase();
  filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(keyword) ||
      user.surname.toLowerCase().includes(keyword)
  );
  if (!keyword) {
    alert("請輸入關鍵字!");
    searchInput.focus();
  }
  if (filteredUsers.length === 0) {
    alert("搜尋不到內容，請重新輸入關鍵字!");
    searchInput.select();
    return;
  }
  getUsersByPage(1);
  addPaginator(filteredUsers.length);
});

//監聽分頁鈕
paginator.addEventListener("click", function onPaginatorClick(event) {
  let target = event.target;
  let page = Number(target.innerText);
  if (target.matches(".page-link")) {
    getUsersByPage(page);
  }
});
