// Find the date picker inputs and the button on the page.
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const button = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const modalVideoLink = document.getElementById('modalVideoLink');
const closeModalButton = document.getElementById('closeModalButton');

// Call the setupDateInputs function from dateRange.js.
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Show a simple placeholder message in the gallery.
function showPlaceholder(message) {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔭</div>
      <p>${message}</p>
    </div>
  `;
}

// Open the modal with the full details for one image.
function openModal(item) {
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;

  if (item.media_type === 'video') {
    modalImage.style.display = 'none';
    modalVideoLink.innerHTML = `
      <a href="${item.url}" target="_blank" rel="noopener noreferrer">
        Watch this video on NASA
      </a>
    `;
  } else {
    modalImage.style.display = 'block';
    modalImage.src = item.hdurl || item.url;
    modalImage.alt = item.title;
    modalVideoLink.innerHTML = '';
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

// Close the modal.
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

// Build one gallery card from one APOD object.
function createGalleryItem(item) {
  const card = document.createElement('div');
  card.className = 'gallery-item';
  const isVideo = item.media_type === 'video';
  const thumbnail = isVideo ? (item.thumbnail_url || '') : item.url;

  card.innerHTML = `
    ${isVideo ? `
      <div class="video-card">
        <div class="video-label">VIDEO</div>
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="video-link">
          Open video
        </a>
      </div>
    ` : `
      <img src="${thumbnail}" alt="${item.title}" />
    `}
    <p><strong>${item.title}</strong></p>
    <p>${item.date}</p>
    <p class="card-hint">
      ${isVideo ? 'This entry is a video. Click to open the video details and link.' : 'Click to view the full image and explanation.'}
    </p>
  `;

  card.addEventListener('click', () => openModal(item));

  return card;
}

closeModalButton.addEventListener('click', closeModal);

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

// When the button is clicked, request images from NASA.
button.addEventListener('click', async () => {
  // Read the dates chosen by the user.
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Make sure both dates were chosen.
  if (!startDate || !endDate) {
    showPlaceholder('Please select both a start and end date.');
    return;
  }

  // Make sure the start date is not after the end date.
  if (startDate > endDate) {
    showPlaceholder('Please choose an end date that is after the start date.');
    return;
  }

  // Show a loading message while the request is happening.
  showPlaceholder('Loading space images from NASA...');

  // Build the API URL with the selected dates.
  const apiKey = 'TJkN6F3SOdZX9sZlY3B0bvS7DSEufE0E6qLmxU9m';
  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  try {
    // Send the request to NASA.
    const response = await fetch(apiUrl);

    // If the request did not work, stop and show an error.
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    // Convert the response body from JSON to JavaScript objects.
    const data = await response.json();

    // Clear the old gallery content before adding new cards.
    gallery.innerHTML = '';

    // If NASA returns no results, show a friendly message.
    if (!Array.isArray(data) || data.length === 0) {
      showPlaceholder('No space images were found for that date range.');
      return;
    }

    // Loop through each returned object and create a card for it.
    data.forEach((item) => {
      const card = createGalleryItem(item);
      gallery.appendChild(card);
    });
  } catch (error) {
    // Show a message if anything goes wrong.
    console.error(error);
    showPlaceholder('Unable to load images right now. Please try again later.');
  }
});
