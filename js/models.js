"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */
  getHostName() {
    return new URL(this.url).host;
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */
class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  // generating StoryList
  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // getting stories from API
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turning story objects from API to StoryList appropriate array
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  // adding story and getting data from submit form
  async addStory(currentUser, { title, author, url }) { // taking in userdata and object
    const token = currentUser.loginToken; // variable for token
    let res = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      data: {
        token: token,
        story: { author, title, url }
      }
    }); // posting to API, MAKE SURE it contains https://
    const story = new Story(res.data.story); // creating new Story object
    this.stories.unshift(story);
    currentUser.ownStories.unshift(story);

    return story;
    // UNIMPLEMENTED: complete this function!
  }

  // removing story and formatting for appropriate API parameters
  async removeStory(user, storyId) {
    const token = user.loginToken;
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token: user.loginToken }
    })
    // filtering story Ids that are being removed
    this.stories = this.stories.filter(story => story.storyId === storyId); // creates a new object with ID of story being removed
    user.favorites = user.favorites.filter(value => value.storyId !== storyId) // same for favorites
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  };

  // signing up through API and POST request
  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    // creating user object that holds data
    let { user } = response.data

    // sending object to User
    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  // logging in, taking data from login form and sending post request to API
  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */
  // getting user credentials
  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  // adding favorited stories and pushing to story and sending to function to update API
  async addFavorite(story) {
    this.favorites.push(story);
    await this._addOrRemoveFavorite("add", story)
  };

  // same thing as above, but removing
  async removeFavorite(story) {
    // pulling id from story to update API
    this.favorites = this.favorites.filter(value => value.storyId !== story.storyId);
    await this._addOrRemoveFavorite("remove", story)
  }

  // accepting "add" or "remove" from above functions, as well as story and updating API with added token
  async _addOrRemoveFavorite(newState, story) {
    const method = newState === "add" ? "POST" : "DELETE";
    const token = this.loginToken; // need authentication
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: method,
      data: { token },
    });
  }

  // updates DOM if story is favorited or not
  isFavorite(story) {
    return this.favorites.some(s => (s.storyId === story.storyId));
  }
}