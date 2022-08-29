"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

// showing stories when site loads
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove(); // removing loading message

  putStoriesOnPage();
}

// creating HTML for each story with added delete button and star when user is logged in = true
function generateStoryMarkup(story, showDeleteBtn = false) {
  const hostName = story.getHostName();
  const showStar = Boolean(currentUser); // if user is logged in, show the fav star
  // creating HTML for each story
  return $(` 
      <li id="${story.storyId}">
      ${showDeleteBtn ? deleteBtn() : ""}
      ${showStar ? applyStar(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

// adding star HTML to story
function applyStar(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far"; // if API shows that user has favorited, style star respecively
  return `<span class="star"><i class="${starType} fa-star"></i></span>`;
}

// adding delete button
function deleteBtn() {
  return `<span class="trash-can">
  <i class="fa-solid fa-trash-can"></i>
  </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  // clean slate
  $allStoriesList.empty();
  // loop through all of our stories and generate HTML
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story); // sending to generate HTML
    $allStoriesList.append($story); // append to ol as lis
  }

  hidePageComponents(); // making sure to hide login/signup form and user stories
  $allStoriesList.show();
}

// submitting story with values in inputs
async function submitStory(evt) {
  console.debug("submitStory");
  evt.preventDefault();
  // getting text from inputs
  let author = $('#author-post').val();
  let title = $('#title-post').val();
  let url = $('#url-post').val();
  let username = currentUser.username;
  let newStory = { title, url, author, username } // object to send out to addStory

  const story = await storyList.addStory(currentUser, newStory); // storing data returned

  const $story = generateStoryMarkup(story); // send story from addStory
  $allStoriesList.prepend($story); // add to story list
  $('#submit-form').hide(); // hide form after submit
  await putStoriesOnPage();
};
$('#submit-post').on("click", submitStory);

// putting user stories on page
function putUserStoriesOnPage() {
  console.debug("putUsersStoriesOnPage");
  // clean slate
  $("#my-stories").empty();

  if (currentUser.ownStories.length === 0) {
    $("#my-stories").append("<h5>No stories added by user yet!</h5>");
  } else {
    // generating HTML for user created stories via loop
    for (let story of currentUser.ownStories) {
      // true generates the trash can 
      let $story = generateStoryMarkup(story, true);
      $("#my-stories").append($story);
    }
  }
}

// deleting story
async function deleteStory(evt) {
  console.debug('deleteStory');
  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li") // li closest to story
  const storyId = $closestLi.attr("id"); // grab id
  // updating API of story that is deleted by sending storyId
  await storyList.removeStory(currentUser, storyId);
  alert("Your story has been deleted!");

  // reloading main page
  location.reload();
}
$("#my-stories").on("click", ".trash-can", deleteStory);

// favorites link
function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");
  // clean slate
  $favStories.empty();

  if (currentUser.favorites.length === 0) {
    $favStories.append("<h5>No favorites added!</h5>");
  } else {
    // generate HTML for favorited stories
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story, false);
      $favStories.append($story);
    }
  }
  $favStories.show();
}

// toggling favorited stories
async function toggleFavorite(evt) {
  console.debug("favorite!");
  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li") // li closest to story
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(value => value.storyId === storyId);
  if ($tgt.hasClass("fas")) { // if story is favorited
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far"); // remove favorite
  } else {
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}
// event listener to toggle favorites
$("#all-stories-list").on("click", ".star", toggleFavorite);
$favStories.on("click", ".star", toggleFavorite);
