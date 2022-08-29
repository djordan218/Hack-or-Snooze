"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories");
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function submitClick(evt) {
  console.debug("submitClick");
  $("#submit-form").show()
}

function hideForm(evt) {
  evt.preventDefault();
  $("#submit-form").hide()
}

$("#navSubmit").on("click", submitClick)
$("#hide-form").on("click", hideForm)

function showUserStories(evt) {
  hidePageComponents();
  putUserStoriesOnPage();
  $myStories.show();
}

$('#nav-my-stories').on("click", showUserStories);

function navFavorites(evt) {
  console.debug("navFavorites");
  hidePageComponents();
  putFavoritesListOnPage();
}

$('#nav-favorites').on("click", navFavorites);