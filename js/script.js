const openNavButton = document.querySelector('.js-nav-open');
const closeNavButton = document.querySelector('.js-nav-close');
const media = window.matchMedia('(width < 768px)');
const navContent = document.querySelector('.js-nav-content');
const main = document.querySelector('main');
const body = document.querySelector('body');

const openMobileNavigation = () => {
  openNavButton.setAttribute('aria-expanded', 'true');
  navContent.removeAttribute('inert');
  navContent.removeAttribute('style');
  main.setAttribute('inert', '');
  body.classList.add('disable-scroll');
  closeNavButton.focus();
}

const closeMobileNavigation = () => {
  openNavButton.setAttribute('aria-expanded', 'false');
  navContent.setAttribute('inert', '');
  main.removeAttribute('inert');
  body.classList.remove('disable-scroll');
  openNavButton.focus();

  setTimeout(() => {
    navContent.style.transition = 'none';
  }, 400);
}

const setupNavigation = (e) => {
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

  const useCases = document.querySelectorAll('.js-use-case');
  const posts = localStorage.getItem('posts');
  const formattedPosts = JSON.parse(posts);

  lastPage = Math.ceil(formattedPosts.length / postsPerPage);

  init(formattedPosts);

  useCases.forEach((item, index) => {
    if (index === useCases.length - 1) {
      item.addEventListener('click', (e) => {
        showAlert(`${item.href} - page param is out of max pages range. It will be replaced with the biggest possible page number`)
      })
    } else {
      item.addEventListener('click', (e) => {
        showAlert(`${item.href} - page param will be removed since it's not valid`);
      })
    }
  });
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

const showAlert = (message) => alert(message);

const backToTopElement = document.querySelector('.js-back-to-top');

const backToTop = () => {
  if (!backToTopElement) {
    return;
  }

  backToTopElement.addEventListener('click', () => {
    window.scrollTo(0, 0);
  })
};

backToTop();