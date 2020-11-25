import {
  CLASS_HIDE,
  EVENT_CLICK,
  EVENT_DBLCLICK,
  EVENT_DRAG_START,
  EVENT_KEY_DOWN,
  EVENT_LENTA,
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
    let zoomedImages = [];
    const resetBtn = document.querySelector('.js-reset-btn');
    addClass(resetBtn, CLASS_HIDE);
    addListener(resetBtn, EVENT_CLICK, () => {
      addClass(resetBtn, CLASS_HIDE);
      zoomedImages.forEach((img) => {
        img.ratio = 1;
        setStyle(img, getTransforms({}));
      });
      zoomedImages = [];
    });
    addListener(megaGallery, EVENT_LENTA, () => {
      forEach(this.images, (image, index) => {
        const { src } = image;
        const alt = image.alt || getImageNameFromURL(src);
        const url = this.getImageURL(image);

        if (src || url) {
          const img = document.createElement('img');
          img.ratio = 1;

          addListener(img, EVENT_WHEEL, (event) => {
            if (!event.ctrlKey) {
              return;
            }
            removeClass(resetBtn, CLASS_HIDE);
            let delta = 0;
            if (event.deltaY) {
              delta = event.deltaY > 0 ? 1 : -1;
            } else if (event.wheelDelta) {
              delta = -event.wheelDelta / 120;
            } else if (event.detail) {
              delta = event.detail > 0 ? 1 : -1;
            }
            zoomedImages.push(img);
            let scale = img.ratio * (1 + -delta * 0.1);
            scale = scale < 1 ? 1 : scale;
            img.ratio = scale;
            setStyle(img, assign({
            }, getTransforms({
              scaleX: scale,
              scaleY: scale,
            })));
          });

          img.src = src || url;
          img.alt = alt;
          img.setAttribute('data-index', index);
          img.setAttribute('data-original-url', url || src);
          megaGallery.appendChild(img);
        }
      });
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
