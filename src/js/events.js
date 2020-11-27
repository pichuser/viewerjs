import {
  CLASS_HIDE,
  CLASS_LOADING,
  EVENT_CLICK,
  EVENT_DBLCLICK,
  EVENT_DRAG_START,
  EVENT_KEY_DOWN,
  EVENT_LENTA,
  EVENT_LOAD,
  EVENT_POINTER_DOWN,
  EVENT_POINTER_MOVE,
  EVENT_POINTER_UP,
  EVENT_RESIZE,
  EVENT_WHEEL,
} from './constants';
import {
  addClass,
  addListener,
  assign,
  forEach,
  getImageNameFromURL,
  getTransforms,
  removeClass,
  removeListener,
  setStyle,
} from './utilities';

export default {
  bind() {
    const {
      options, viewer, canvas, megaGallery,
    } = this;
    const document = this.element.ownerDocument;

    addListener(viewer, EVENT_CLICK, (this.onClick = this.click.bind(this)));
    addListener(viewer, EVENT_DRAG_START, (this.onDragStart = this.dragstart.bind(this)));
    addListener(canvas, EVENT_POINTER_DOWN, (this.onPointerDown = this.pointerdown.bind(this)));
    addListener(document, EVENT_POINTER_MOVE, (this.onPointerMove = this.pointermove.bind(this)));
    addListener(document, EVENT_POINTER_UP, (this.onPointerUp = this.pointerup.bind(this)));
    addListener(document, EVENT_KEY_DOWN, (this.onKeyDown = this.keydown.bind(this)));
    addListener(window, EVENT_RESIZE, (this.onResize = this.resize.bind(this)));
    const button = document.querySelector('.js-close-mega-gallery');
    addListener(button, EVENT_CLICK, () => {
      this.lentaViewing = false;
      addClass(megaGallery, CLASS_HIDE);
    });
    const resetBtn = document.querySelector('.js-reset-btn');
    const galleryBody = megaGallery.querySelector('.viewer-mega-gallery-body');
    addClass(resetBtn, CLASS_HIDE);
    addListener(resetBtn, EVENT_CLICK, () => {
      addClass(resetBtn, CLASS_HIDE);
      const { scrollLeft } = megaGallery;
      setStyle(galleryBody, getTransforms({}));
      megaGallery.scrollLeft = scrollLeft / galleryBody.ratio;
      galleryBody.ratio = 1;
    });
    galleryBody.ratio = 1;
    addListener(megaGallery, EVENT_WHEEL, (event) => {
      if (!event.ctrlKey) {
        return;
      }
      removeClass(resetBtn, CLASS_HIDE);
      event.preventDefault();
      let delta = 1;
      if (event.deltaY) {
        delta = event.deltaY > 0 ? 1 : -1;
      } else if (event.wheelDelta) {
        delta = -event.wheelDelta / 120;
      } else if (event.detail) {
        delta = event.detail > 0 ? 1 : -1;
      }
      const multiply = 1 - delta * 0.05;
      let scale = galleryBody.ratio * multiply;
      scale = scale < 1 ? 1 : scale;
      galleryBody.ratio = scale;
      setStyle(galleryBody, assign({
      }, getTransforms({
        scaleX: scale,
        scaleY: scale,
      })));
      if (scale !== 1) {
        megaGallery.scrollLeft *= multiply;
      }
      if (scale === 1) {
        addClass(resetBtn, CLASS_HIDE);
      }
    }, {
      passive: false,
      capture: true,
    });
    addListener(megaGallery, EVENT_LENTA, () => {
      const loadStatus = [];
      addClass(megaGallery, CLASS_LOADING);
      forEach(this.images, (image, index) => {
        const { src } = image;
        const alt = image.alt || getImageNameFromURL(src);
        const url = this.getImageURL(image);

        if (src || url) {
          const img = document.createElement('img');

          img.src = src || url;
          img.alt = alt;
          img.setAttribute('data-index', index);
          img.setAttribute('data-original-url', url || src);
          const promise = new Promise((resolve) => {
            addListener(img, EVENT_LOAD, () => {
              resolve();
            });
            addListener(img, 'error', () => {
              resolve();
            });
          });
          loadStatus.push(promise);
          galleryBody.appendChild(img);
        }
      });
      Promise.all(loadStatus).then(() => removeClass(megaGallery, CLASS_LOADING));
    }, { once: true });

    if (options.zoomable && options.zoomOnWheel) {
      addListener(viewer, EVENT_WHEEL, (this.onWheel = this.wheel.bind(this)), {
        passive: false,
        capture: true,
      });
    }

    if (options.toggleOnDblclick) {
      addListener(canvas, EVENT_DBLCLICK, (this.onDblclick = this.dblclick.bind(this)));
    }
  },

  unbind() {
    const { options, viewer, canvas } = this;
    const document = this.element.ownerDocument;

    removeListener(viewer, EVENT_CLICK, this.onClick);
    removeListener(viewer, EVENT_DRAG_START, this.onDragStart);
    removeListener(canvas, EVENT_POINTER_DOWN, this.onPointerDown);
    removeListener(document, EVENT_POINTER_MOVE, this.onPointerMove);
    removeListener(document, EVENT_POINTER_UP, this.onPointerUp);
    removeListener(document, EVENT_KEY_DOWN, this.onKeyDown);
    removeListener(window, EVENT_RESIZE, this.onResize);

    if (options.zoomable && options.zoomOnWheel) {
      removeListener(viewer, EVENT_WHEEL, this.onWheel, {
        passive: false,
        capture: true,
      });
    }

    if (options.toggleOnDblclick) {
      removeListener(canvas, EVENT_DBLCLICK, this.onDblclick);
    }
  },
};
