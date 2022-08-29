"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

// showing all stories when "Hack or Snooze" is clicked
function navAllStories(evt) {
  console.debug("navAllStories");
  hidePageComponents();
  putStoriesOnPage();
}
$body.on("click", "#nav-all", navAllStories);

// show login and sign up form when login/signup is clicked
function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}
$navLogin.on("click", navLoginClick);

// updating nav when loggin in, showing username
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

// submitting form on submit button
function submitClick(evt) {
  console.debug("submitClick");
  $("#submit-form").show()
}
$("#navSubmit").on("click", submitClick)

// hiding form on hide form button
function hideForm(evt) {
  evt.preventDefault();
  $("#submit-form").hide()
};
$("#hide-form").on("click", hideForm)

// showing user stories when "my stories" is clicked
function showUserStories(evt) {
  hidePageComponents();
  putUserStoriesOnPage();
  $myStories.show();
};
$('#nav-my-stories').on("click", showUserStories);

// showing favorited stories when "favorites" is clicked
function navFavorites(evt) {
  console.debug("navFavorites");
  hidePageComponents();
  putFavoritesListOnPage();
}
$('#nav-favorites').on("click", navFavorites);