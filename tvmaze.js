"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");

const TV_MAZE_URL = "http://api.tvmaze.com";
const MISSING_IMAGE_URL = "https://tinyurl.com/tv-missing";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  console.log('making request to api to get shows');
  // Make request to TVMaze search shows API.
  const params = new URLSearchParams({ q: term });
  const response = await fetch(
    // note: unable to have headers for TV Maze API due to cors
    `${TV_MAZE_URL}/search/shows?${params}`,
    {
      method: "GET",
    });

  const searchResults = await response.json();

  const shows = searchResults.map((searchResult) => {
    const { id, name, summary } = searchResult.show;
    const filteredData = { id, name, summary };

    if (searchResult.show.image) {
      filteredData.image = searchResult.show.image.medium;
    }
    else {
      filteredData.image = MISSING_IMAGE_URL;
    }

    return filteredData;
  });

  return shows;
}

/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  console.log("shows retrived:", shows);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  console.log('making request to api to get episodes');
  // Make request to TVMaze search episodes API.
  const response = await fetch(
    `${TV_MAZE_URL}/shows/${id}/episodes`,
    {
      method: "GET",
    });

  const searchResults = await response.json();

  const episodes = searchResults.map((searchResult) => {
    const { id, name, season, number } = searchResult;
    const filteredData = { id, name, season, number };

    return filteredData;
  });

  console.log('Show id:', id);
  console.log('Episodes found:', episodes);
  return episodes;
}

/** Given an array of episodes data from getEpisodesOfShow, appends episode
 * data into the DOM by populating #episodesList. Clear episodes list first.
 */

async function displayEpisodes(episodes) {

  $episodesList.empty();
  for (const episode of episodes) {
    $episodesList.append(
      $('<li>')
        .text(
          `${episode.name} (season ${episode.season}, number ${episode.number})`
        )
    );
  }
  console.log('displayEpisodes completed');
}

/**  * Handle episode button submission: get shows from API and display.
 *   Show episodes area and add found episodes to that area*/

async function searchEpisodesAndDisplay(id){

  console.log('getting episodes for show:', id);
  $episodesArea.show();

  const episodes = await getEpisodesOfShow(id);

  console.log('episodes retrieved:', episodes);
  await displayEpisodes(episodes);

  console.log('added episodes to episodes area');
}

/** Add listener to episodes button. Get Parent element to obtain show id
*/

$showsList.on("click", "button", async function handleEpisodesButton(evt) {
  evt.preventDefault();

  console.log("clicked episodes button");
  const id = $(evt.target).parents().eq(2).attr('data-show-id');
  console.log('show ID:', id);

  await searchEpisodesAndDisplay(id);

});
