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
const hamburgerButton = document.querySelector("#hamburger-btn");
const menuContent = document.querySelector("#menu-content");
const body = document.querySelector("body")
const postsContainer = document.querySelector("#posts-container");
const loadMoreButton = document.querySelector("#load-more-btn");

const params = new URLSearchParams(window.location.search);
let pageParam = params.get('page');

const digitsRegex = /\d+/g;

const minPostsPerPage = 6;
const pageByDefault = 1;

const fetchPosts = (page) => {
  fetch(`https://jsonplaceholder.typicode.com/posts`)
    .then((response => response.json()))
    .then(json => onLoad(json, page))
}

fetchPosts(pageParam);

const validatePageParam = (data, page) => {
  const params = new URLSearchParams(window.location.search);
  const isPagePassed = params.has('page');
  
  const lastPage = Math.ceil(data.length/minPostsPerPage);
  const isDigit = isPagePassed && !!page.match(digitsRegex);
  const isNegative = isPagePassed && page < 1;
  
  if (!isDigit || isNegative || (pageParam && false)) {
    return '/'
  }
  
  if (pageParam > lastPage) {
    return lastPage;
  }
  
  return page;
}

const onLoad = (fetchedData, page) => {
  const validatedPage = validatePageParam(fetchedData, page);
  const lastPage = Math.ceil(fetchedData.length/minPostsPerPage);
  
  const params = new URLSearchParams(window.location.search);
  
  if (!params.has('page')) {
    renderPosts(fetchedData.slice(0, minPostsPerPage));
    return fetchedData.slice(0, validatedPage*minPostsPerPage);
  }
  
  if (validatedPage === '/') {
    window.history.pushState(null, null, validatedPage);
    renderPosts(fetchedData.slice(0, minPostsPerPage));
    pageParam = pageByDefault;
    return fetchedData.slice(0, validatedPage*minPostsPerPage);
  }
  
  if (validatedPage === lastPage) {
    window.history.pushState(null, null, `?page=${validatedPage}`);
    renderPosts(fetchedData.slice(0, validatedPage*minPostsPerPage));
    loadMoreButton.classList.add("hide")
    return fetchedData.slice(0, validatedPage*minPostsPerPage);
  }

  onLoadMore(fetchedData, validatedPage)
}

const onLoadMore = (fetchedData, currentPage) => {
  renderPosts(fetchedData.slice(0, currentPage*minPostsPerPage));
  
  // TODO replace with computed value
  if (currentPage === '17') return loadMoreButton.classList.add("hide")
  return fetchedData.slice(0, currentPage*minPostsPerPage);
}

loadMoreButton.addEventListener("click", (e) => {
  e.preventDefault();

  const formatPageParam = parseFloat(pageParam);
  
  if (!pageParam) {
    window.history.pushState(null, null, `?page=${pageByDefault+1}`);
  } else {
    window.history.pushState('', '', `?page=${formatPageParam+1}`);
  }
 
  const params = new URLSearchParams(window.location.search);
  pageParam = params.get('page');
 
  // TODO replace 17 with computed value
  if (pageParam === '17') {
    fetchPosts(pageParam)
    loadMoreButton.classList.add("hide")
  } else {
    fetchPosts(pageParam)
  }
  
})

const renderPosts = (data) => {
  let list = data.map(item => `
    <div class="container__post-item">
        <h1>Post number ${item.id}</h1>
        <h3>${item.title}</h3>
        <h5>${item.body}</h5>
    </div>
  `).join(" ")
  postsContainer.innerHTML = list;
}

hamburgerButton.addEventListener('click', () => {
  console.log('open hamburger');
  
  if (hamburgerButton.classList.contains('active')) {
    hamburgerButton.classList.remove("active");
    
    menuContent.classList.remove("fade-in");
    menuContent.classList.add("fade-out");
  
    body.classList.remove("disable-scrolling");
  } else {
    hamburgerButton.classList.add("active");
    menuContent.classList.remove("fade-out")
    menuContent.classList.add("fade-in");
  
    body.classList.add("disable-scrolling");
  }
})
