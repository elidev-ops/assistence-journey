export const galleryElm = (images, searchParam) => /* html */ `
  <div class="gallery">
  <h1>Galeria de imagens do ${searchParam}</h1>
    <div class="gallery-controls">
      <button class="gallery-btn" data-close-gallery="true">
        <i class="bx bx-x"></i>
      </button>
      </div>
    <div class="gallery-container">
      ${images.reduce((acc, cur) => acc += /* html */ `
      <div class="masonry">
        <img src="${cur.url}" alt="${cur.title}" title="${cur.title}" />
        <span>${cur.title}</span>
      </div>
    `, '')}
    </div>
  </div>`
  