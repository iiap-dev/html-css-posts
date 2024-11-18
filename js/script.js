/*
--------------------------------------------------
An assignment is to implement basic pagination with search/filter functionality.

API: https://jsonplaceholder.typicode.com/posts

Requirements:

On initial load, app should fetch the posts from the provided API.
User should be presented with 6 posts per load/page.
Below the posts, there should be a "Load More" button which would load the next chunk of (6) posts.
Whenever the "Load More" button is pressed, the URL should be updated with the query parameter "page" to denote
the current state of the loaded posts. Only posts that belong to the current page should be loaded in the DOM.

Example:
https://example.com/?page=3 - this means that the user is on page 3 and 18 posts should be shown.

Make sure that, if a user lands directly to the URL (opens it manually in the browser) with the parameter "page",
that he's taken to the corresponding page.

Effectively, https://example.com/ and https://example.com/?page=1 should be treated the same.

Use cases for different URL scenarios:

https://example.com/?page=-5 - clear the "page" query parameter since it's less than 1.
https://example.com/?page=word - clear the "page" query parameter since it's invalid.
https://example.com/?page= - clear the "page" query parameter since it's invalid.
https://example.com/?page=30 - if we assume there are only 10 pages, update the query parameter with the biggest page number possible. In this case, parameter page would be updated from 30 to 10.

If there are no more posts to load, hide the "Load More" button.

Above the posts, there should be an input field which would be used to search/filter through loaded posts. Filtering should be done as the user types. Words should be case insensitive. Search term should also be tracked with a query parameter, in this case "search".

Example:
https://example.com/?page=3&search=code - show only posts (from the first 18 posts) that contain the word "code" in the title and/or body.

--------------------------------------------------
*/

// Write Javascript code!
const openNavButton = document.querySelector('.js-nav-open');
const closeNavButton = document.querySelector('.js-nav-close');
const media = window.matchMedia('(width < 768px)');
const navContent = document.querySelector('.js-nav-content');
const main = document.querySelector('main');
const body = document.querySelector('body');

function openMobileNavigation() {
  openNavButton.setAttribute('aria-expanded', 'true');
  navContent.removeAttribute('inert');
  navContent.removeAttribute('style');
  main.setAttribute('inert', '');
  body.classList.add('disable-scroll');
  closeNavButton.focus();
}

function closeMobileNavigation() {
  openNavButton.setAttribute('aria-expanded', 'false');
  navContent.setAttribute('inert', '');
  main.removeAttribute('inert');
  body.classList.remove('disable-scroll');
  openNavButton.focus();

  setTimeout(() => {
    navContent.style.transition = 'none';
  }, 400);
}

function setupNavigation(e) {
  if (e.matches) {
    // is mobile
    navContent.setAttribute('inert', '');
    navContent.style.transition = 'none';
  } else {
    // is tablet/desktop
    closeMobileNavigation();
    navContent.removeAttribute('inert');
  }
}

setupNavigation(media);

openNavButton.addEventListener('click', openMobileNavigation);
closeNavButton.addEventListener('click', closeMobileNavigation);

media.addEventListener('change', function (e) {
  setupNavigation(e);
})

const postsContainer = document.querySelector('.js-posts-wrapper');
const loadMoreButton = document.querySelector('.js-load-more-button');

const params = new URLSearchParams(window.location.search);
let pageParam = params.get('page');

const digitsRegex = /^(|-?\d+)$/;

const postsPerPage = 6;
const firstPage = 1;

let lastPage;

const fetchPosts = async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  const data = await response.json();
  window.localStorage.setItem('posts', JSON.stringify(data));
};


window.addEventListener('DOMContentLoaded', () => {
  fetchPosts();

  const posts = localStorage.getItem('posts');
  const formattedPosts = JSON.parse(posts);

  lastPage = Math.ceil(formattedPosts.length / postsPerPage);

  init(formattedPosts);
})

const init = (data) => {
  const validatedPage = validatePageParam(pageParam);

  if (!validatedPage) {
    window.history.pushState(null, null, '/');
    return renderPosts(data.slice(0, postsPerPage));
  }

  if (validatedPage == firstPage) {
    return renderPosts(data.slice(0, postsPerPage));
  }

  if (validatedPage == lastPage) {
    window.history.pushState(null, null, `?page=${validatedPage}`);

    loadMoreButton.classList.add("hide")
    return renderPosts(data.slice(0, validatedPage * postsPerPage));
  }

  window.history.pushState(null, null, `?page=${validatedPage}`);
  return renderPosts(data.slice(0, validatedPage * postsPerPage));
}

const handleClick = (e) => {
  e.preventDefault();

  const posts = localStorage.getItem('posts');
  const formattedPosts = JSON.parse(posts);

  const params = new URLSearchParams(window.location.search);
  const page = params.get('page');

  const validatedPage = validatePageParam(page);

  if (!validatedPage || validatedPage == firstPage) {
    window.history.pushState(null, null, `?page=${firstPage + 1}`);
    return renderPosts(formattedPosts.slice(0, (firstPage + 1) * postsPerPage));
  }

  if (validatedPage == (lastPage - 1)) {
    window.history.pushState(null, null, `?page=${lastPage}`)

    loadMoreButton.classList.add("hide")
    return renderPosts(formattedPosts.slice(0, lastPage * postsPerPage));
  }

  window.history.pushState(null, null, `?page=${parseFloat(validatedPage) + 1}`);
  renderPosts(formattedPosts.slice(0, (parseFloat(validatedPage) + 1) * postsPerPage));
}
loadMoreButton.addEventListener("click", (e) => handleClick(e));

const renderPosts = (data) => {
  let list = data.map(item => `
    <article class="posts__item single-post">
      <h4 class="single-post__heading">${item.title}</h4>
      <p class="single-post__description">${item.body}</p>
      <p class="single-post__number">Post #${item.id}</p>
    </article>
  `).join(" ")
  postsContainer.innerHTML = list;
}

const validatePageParam = (page) => {
  if (!page) {
    return;
  }

  const isPageNumeric = !!page.match(digitsRegex);

  if (page < 1 || !isPageNumeric) {
    return;
  }

  if (pageParam > lastPage) {
    return lastPage;
  }

  return page;
}
