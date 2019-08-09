$(async function () {
    // cache some selectors we'll be using quite a bit
    const $allStoriesList = $("#all-articles-list");
    const $submitForm = $("#submit-form");
    const $filteredArticles = $("#filtered-articles");
    const $favoritedArticles = $("#favorited-articles");
    const $loginForm = $("#login-form");
    const $createAccountForm = $("#create-account-form");
    const $ownStories = $("#my-articles");
    const $navLogin = $("#nav-login");
    const $navLogOut = $("#nav-logout");
    const $navSubmit = $("#nav-submit");
    const $navMystories = $("#nav-mystories");
    const $navFavorites = $("#nav-favorites");
    const $navLoggedIn = $(".nav-logged-in");
    const $hearts = $(".heart");
    const $navProfile = $("#nav-user-profile");
    const $navWelcome = $('#nav-welcome');
    const $userProfile = $('#user-profile');
  
  
    $hearts.addClass('hidden');
  
    // global storyList variable
    let storyList = null;
  
    // global currentUser variable
    let currentUser = null;
  
    await checkIfLoggedIn();
  
    /**
     * Event listener for logging in.
     *  If successfully we will setup the user instance
     */
  
    $loginForm.on("submit", async function (evt) {
      evt.preventDefault(); // no page-refresh on submit
  
      // grab the username and password
      const username = $("#login-username").val();
      const password = $("#login-password").val();
  
      // call the login static method to build a user instance
      const userInstance = await User.login(username, password);
      // set the global user to the user instance
      currentUser = userInstance;
      syncCurrentUserToLocalStorage();
      loginAndSubmitForm();
    });
  
    /**
     * Event listener for signing up.
     *  If successfully we will setup a new user instance
     */
  
    $createAccountForm.on("submit", async function (evt) {
      evt.preventDefault(); // no page refresh
  
      // grab the required fields
      let name = $("#create-account-name").val();
      let username = $("#create-account-username").val();
      let password = $("#create-account-password").val();
  
      // call the create method, which calls the API and then builds a new user instance
      const newUser = await User.create(username, password, name);
      currentUser = newUser;
      syncCurrentUserToLocalStorage();
      loginAndSubmitForm();
    });
  
    /**
     * Log Out Functionality
     */
  
    $navLogOut.on("click", function () {
  
  
      // empty out local storage
      localStorage.clear();
      $navLogin.show();
      $navLogOut.hide();
      $navProfile.hide();
      $navWelcome.hide();
      // refresh the page, clearing memory
      location.reload();
    });
  
    /**
     * Event Handler for Clicking Login
     */
  
    $navLogin.on("click", function () {
      // Show the Login and Create Account Forms
      console.log($loginForm);
      $loginForm.slideToggle();
      $createAccountForm.slideToggle();
      $allStoriesList.toggle();
    });
  
    /**
     * Event handler for Navigation to Homepage
     */
  
    $("body").on("click", "#nav-all", async function () {
      hideElements();
      await generateStories();
      $allStoriesList.show();
    });
  
    /**
     * On page load, checks local storage to see if the user is already logged in.
     * Renders page information accordingly.
     */
  
    async function checkIfLoggedIn() {
      // let's see if we're logged in
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
  
      // if there is a token in localStorage, call User.getLoggedInUser
      //  to get an instance of User with the right details
      //  this is designed to run once, on page load
      currentUser = await User.getLoggedInUser(token, username);
      await generateStories();
  
      if (currentUser) {
        showNavForLoggedInUser();
      }
    }
  
    /**
     * A rendering function to run to reset the forms and hide the login info
     */
  
    function loginAndSubmitForm() {
      // hide the forms for logging in and signing up
      $loginForm.hide();
      $createAccountForm.hide();
  
      // reset those forms
      $loginForm.trigger("reset");
      $createAccountForm.trigger("reset");
  
      // show the stories
      $allStoriesList.show();
  
      // update the navigation bar
      showNavForLoggedInUser();
    }
  
  
    /**
     * A rendering function to call the StoryList.getStories static method,
     *  which will generate a storyListInstance. Then render it.
     */
  
    async function generateStories() {
      // get an instance of StoryList
      const storyListInstance = await StoryList.getStories();
      // update our global variable
      storyList = storyListInstance;
      // empty out that part of the page
      $allStoriesList.empty();
  
      // loop through all of our stories and generate HTML for them
      for (let story of storyList.stories) {
        const result = generateStoryHTML(story);
        $allStoriesList.append(result);
      }
    }
  
    /**
     * A function to render HTML for an individual Story instance
     */
  
    function generateStoryHTML(story) {
      let hostName = getHostName(story.url);
  
      // render story markup
      const storyMarkup = $(`
        <li id="${story.storyId}">
          <i data-story-id="${story.storyId}" class="heart far fa-heart"></i>
          <a class="article-link" href="${story.url}" target="a_blank">
            <strong>${story.title}</strong>
          </a>
          <small class="article-author">by ${story.author}</small>
          <small class="article-hostname ${hostName}">(${hostName})</small>
          <small class="article-username">posted by ${story.username}</small>
        </li>
      `);
  
      return storyMarkup;
    }
  
    /** Copy Render HTML function for Favorites */
    function generateStoryHTMLFav(story) {
      let hostName = getHostName(story.url);
  
      // render story markup
      const storyMarkup = $(`
        <li id="${story.storyId}">
        <i data-story-id="${story.storyId}" class="heart fas fa-heart"></i>
          <a class="article-link" href="${story.url}" target="a_blank">
            <strong>${story.title}</strong>
          </a>
          <small class="article-author">by ${story.author}</small>
          <small class="article-hostname ${hostName}">(${hostName})</small>
          <small class="article-username">posted by ${story.username}</small>
        </li>
      `);
      return storyMarkup;
    }
  
    //Generate User's Stories
  
    function generateStoryHTMLMyStories(story) {
      let hostName = getHostName(story.url);
  
      // render story markup
      const storyMarkup = $(`
        <li id="${story.storyId}">
        <i data-story-id="${story.storyId}" class="trash far fa-trash-alt"></i>
        <i data-story-id="${story.storyId}" class="heart far fa-heart"></i>
          <a class="article-link" href="${story.url}" target="a_blank">
            <strong>${story.title}</strong>
          </a>
          <small class="article-author">by ${story.author}</small>
          <small class="article-hostname ${hostName}">(${hostName})</small>
          <small class="article-username">posted by ${story.username}</small>
        </li>
      `);
      return storyMarkup;
    }
  
    function generateStoryHTMLMyStoryFav(story) {
      let hostName = getHostName(story.url);
  
      // render story markup
      const storyMarkup = $(`
        <li id="${story.storyId}">
        <i data-story-id="${story.storyId}" class="trash far fa-trash-alt"></i>
        <i data-story-id="${story.storyId}" class="heart fas fa-heart"></i>
          <a class="article-link" href="${story.url}" target="a_blank">
            <strong>${story.title}</strong>
          </a>
          <small class="article-author">by ${story.author}</small>
          <small class="article-hostname ${hostName}">(${hostName})</small>
          <small class="article-username">posted by ${story.username}</small>
        </li>
      `);
      return storyMarkup;
    }
  
    /* hide all elements in elementsArr */
    function hideElements() {
      const elementsArr = [
        $submitForm,
        $allStoriesList,
        $filteredArticles,
        $ownStories,
        $loginForm,
        $createAccountForm
      ];
      elementsArr.forEach($elem => $elem.hide());
    }
  
    function showNavForLoggedInUser() {
      $navLogin.hide();
      $navLogOut.show();
      $navLoggedIn.show();
      $navWelcome.show();
      $navProfile.html(`Hello ${currentUser.username}`);
    }
  
    /* simple function to pull the hostname from a URL */
    function getHostName(url) {
      let hostName;
      if (url.indexOf("://") > -1) {
        hostName = url.split("/")[2];
      } else {
        hostName = url.split("/")[0];
      }
      if (hostName.slice(0, 4) === "www.") {
        hostName = hostName.slice(4);
      }
      return hostName;
    }
  
    /* sync current user information to localStorage */
    function syncCurrentUserToLocalStorage() {
      if (currentUser) {
        localStorage.setItem("token", currentUser.loginToken);
        localStorage.setItem("username", currentUser.username);
      }
    }
  
    // Event handler for submit a new story 
    $navSubmit.on('click', function (e) {
      e.preventDefault();
      $submitForm.slideToggle();
    });
  
    // Create new Story
    $submitForm.on('submit', async function (e) {
      e.preventDefault();
      let $submitAuthor = $('#author').val();
      let $submitTitle = $('#title').val();
      let $submitUrl = $('#url').val();
      let userToken = currentUser.loginToken;
  
      await StoryList.addStory(userToken, [$submitAuthor, $submitTitle, $submitUrl])
        .then(setTimeout(function () {
          generateStories();
        }, 100));
  
      $submitForm.slideToggle();
      $('#author').val('');
      $('#title').val('');
      $('#url').val('');
    })
  
    // Specify and delete Favorite
    $allStoriesList.on('click', '.heart', function (e) {
      let favStoryId = $(e.target).attr('data-story-id');
      //change to toggleClass
      if ($(e.target).hasClass('far')) {
        User.newFavorite(currentUser.username, favStoryId, currentUser.loginToken);
        $(e.target).addClass('fas');
        $(e.target).removeClass('far');
      } else if ($(e.target).hasClass('fas')) {
        User.favoriteDelete(currentUser.username, favStoryId, currentUser.loginToken);
        $(e.target).addClass('far');
        $(e.target).removeClass('fas');
      }
    });
  
    // Display Nav Favorites
    $navFavorites.on('click', async function (e) {
      e.preventDefault();
      let favorites = await User.userFavorites(currentUser.username, currentUser.loginToken);
  
      $allStoriesList.empty();
      //current user.favorites
      for (let story of favorites) {
        const result = generateStoryHTMLFav(story);
        $allStoriesList.append(result);
      }
    });
  
    //Display Nav Stories
    $navMystories.on('click', async function (e) {
      e.preventDefault();
      //currentUser.stories
      let stories = await User.getUserStories(currentUser.username, currentUser.loginToken);
      $allStoriesList.empty();
      // console.log(stories)
      let favStories = stories.favorites;
  
      for (let myStory of stories.stories) {
        for (let i = 0; i < favStories.length; i++) {
          if (favStories[i].storyId === myStory.storyId) {
            const result = generateStoryHTMLMyStoryFav(myStory);
            $allStoriesList.append(result);
            break;
          }
          if (i === favStories.length - 1) {
            const result = generateStoryHTMLMyStories(myStory);
            $allStoriesList.append(result);
          }
        }
      }
    })
  
    //Delete User Story
    $allStoriesList.on('click', '.trash', async function (e) {
      let storyId = $(e.target).attr('data-story-id');
      await User.deleteUserStory(storyId, currentUser.loginToken)
      setTimeout(function () {
        generateMyStories();
      }, 100);
    })
  
    //Generate User Stories after delete
    async function generateMyStories() {
      let stories = await User.getUserStories(currentUser.username, currentUser.loginToken);
      $allStoriesList.empty();
      let favStories = stories.favorites;
  
  
      for (let myStory of stories.stories) {
        for (let i = 0; i < favStories.length; i++) {
          if (favStories[i].storyId === myStory.storyId) {
            const result = generateStoryHTMLMyStoryFav(myStory);
            $allStoriesList.append(result);
            break;
          }
          if (i === favStories.length - 1) {
            const result = generateStoryHTMLMyStories(myStory);
            $allStoriesList.append(result);
          }
        }
      }
    }
  
    $navProfile.on('click', function (e) {
      e.preventDefault();
  
      $allStoriesList.empty();
      $userProfile.show();
      $('#profile-name').append(` ${currentUser.name}`);
      $('#profile-username').append(` ${currentUser.username}`);
      $('#profile-account-date').append(` ${currentUser.createdAt}`);
  
  
    })
  
  });
  
  