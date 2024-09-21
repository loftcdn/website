document.addEventListener("DOMContentLoaded", function () {
  let isMenuOpen = false;
  let movementAnimation = null;
  let ellipseCenter = { left: 0, top: 0 };

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function keepInBounds(element, left, top) {
    const margin = 8;
    const rect = element.getBoundingClientRect();
    const containerWidth = isMenuOpen ? rect.width : element.offsetWidth;
    const containerHeight = element.offsetHeight;

    left = Math.max(margin, Math.min(left, window.innerWidth - containerWidth - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - containerHeight - margin));

    return { left, top };
  }

  function checkAndAdjustAlignment(element) {
    if (!isMenuOpen && window.innerWidth > 767) {
      const pageWidth = window.innerWidth;
      const navPosition = element.offsetLeft;
      const navWidth = element.offsetWidth;

      const rightBoundary = pageWidth * 0.7;
      const leftBoundary = pageWidth * 0.3;

      if (navPosition + navWidth >= rightBoundary) {
        element.style.alignItems = 'flex-end';
      } else if (navPosition <= leftBoundary) {
        element.style.alignItems = 'flex-start';
      } else {
        element.style.alignItems = 'center';
      }
    }
  }

  function moveNavElliptically(element) {
    if (window.innerWidth <= 767 || isMenuOpen) {
      cancelAnimationFrame(movementAnimation);
      return;
    }

    const a = 3; // vertical radius
    const b = 6; // horizontal radius
    const duration = 4000;
    let startTime = null;

    function animate(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = (elapsed % duration) / duration;

      const angle = progress * 2 * Math.PI;
      const x = b * Math.cos(angle);
      const y = a * Math.sin(angle);

      const newLeft = ellipseCenter.left + x;
      const newTop = ellipseCenter.top + y;

      element.style.left = `${newLeft}px`;
      element.style.top = `${newTop}px`;

      if (window.innerWidth > 767 && !isMenuOpen) {
        movementAnimation = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(movementAnimation);
      }
    }

    movementAnimation = requestAnimationFrame(animate);
  }

  function toggleTransition(element, enable) {
    element.style.transition = enable ? '' : 'none';
  }

  function makeElementDraggable(dragHandles, element) {
    if (window.innerWidth <= 767) return;

    let offsetX = 0, offsetY = 0, startX = 0, startY = 0;
    let isDragging = false;
    let isDragThresholdMet = false;
    let dragDistanceThreshold = 24;
    let totalDragDistance = 0;

    dragHandles.forEach(dragHandle => {
      dragHandle.addEventListener('mousedown', function (e) {
        if (window.innerWidth <= 767) return;
        e.preventDefault();
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        offsetX = startX - parseFloat(element.style.left || 0);
        offsetY = startY - parseFloat(element.style.top || 0);

        totalDragDistance = 0;
        isDragThresholdMet = false;

        dragHandle.style.cursor = 'grabbing';
        toggleTransition(element, false);

        document.addEventListener('mousemove', elementDrag);
        document.addEventListener('mouseup', closeDragElement);
      });
    });

    element.addEventListener('click', function (e) {
      if (isDragThresholdMet || totalDragDistance > dragDistanceThreshold) {
        e.preventDefault();
        isDragThresholdMet = false;
      }
    });

    function elementDrag(e) {
      if (!isDragging || window.innerWidth <= 767) return;
      e.preventDefault();

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      totalDragDistance += Math.sqrt(dx * dx + dy * dy);

      if (totalDragDistance > dragDistanceThreshold) {
        isDragThresholdMet = true;
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        const boundedPosition = keepInBounds(element, newX, newY);
        element.style.left = boundedPosition.left + "px";
        element.style.top = boundedPosition.top + "px";
        ellipseCenter = boundedPosition;
      }
    }

    function closeDragElement() {
      isDragging = false;
      dragHandles.forEach(dragHandle => {
        dragHandle.style.cursor = 'grab';
      });
      document.removeEventListener('mousemove', elementDrag);
      document.removeEventListener('mouseup', closeDragElement);

      if (isDragThresholdMet) {
        const navPosition = {
          left: element.style.left,
          top: element.style.top
        };
        localStorage.setItem('navPosition', JSON.stringify(navPosition));

        checkAndAdjustAlignment(element);
      }

      toggleTransition(element, true);
    }
  }

  function resetNavPosition(element) {
    cancelAnimationFrame(movementAnimation);
    element.style.left = '';
    element.style.top = '';
    element.classList.remove('nav-hidden');
    element.style.alignItems = '';
    ellipseCenter = { left: 0, top: 0 };
  }

  function restoreNavPosition(element) {
    if (window.innerWidth <= 767) {
      resetNavPosition(element);
      return;
    }

    cancelAnimationFrame(movementAnimation);
    const savedPosition = JSON.parse(localStorage.getItem('navPosition'));
    
    const defaultLeft = (window.innerWidth / 2) - (element.offsetWidth / 2);
    const defaultTop = 8;

    if (savedPosition && savedPosition.left && savedPosition.top) {
      ellipseCenter = {
        left: parseFloat(savedPosition.left),
        top: parseFloat(savedPosition.top)
      };
    } else {
      ellipseCenter = { left: defaultLeft, top: defaultTop };
    }

    const boundedPosition = keepInBounds(element, ellipseCenter.left, ellipseCenter.top);
    ellipseCenter = boundedPosition;
    
    toggleTransition(element, false);
    
    element.style.left = boundedPosition.left + "px";
    element.style.top = boundedPosition.top + "px";

    checkAndAdjustAlignment(element);
    element.classList.remove('nav-hidden');

    setTimeout(() => {
      toggleTransition(element, true);
      if (!isMenuOpen) {
        moveNavElliptically(element);
      }
    }, 50);
  }

  function openMenu(nestedContainer, closeIcon) {
    if (window.innerWidth <= 767) return;

    const nav = document.querySelector(".nav");
    
    cancelAnimationFrame(movementAnimation);
    isMenuOpen = true;

    nav.style.left = `${ellipseCenter.left}px`;
    nav.style.top = `${ellipseCenter.top}px`;

    nestedContainer.style.display = "flex";
    closeIcon.style.display = "inline";
    
    requestAnimationFrame(() => {
      nestedContainer.classList.add("active");
      checkAndAdjustAlignment(nav);
    });
    
    storeMenuState('open');
  }

  function closeMenu(nestedContainer, closeIcon) {
    if (window.innerWidth <= 767) return;

    const nav = document.querySelector(".nav");
    
    nestedContainer.classList.remove("active");
    closeIcon.style.display = "none";
    
    requestAnimationFrame(() => {
      nestedContainer.style.display = "none";
      isMenuOpen = false;
      checkAndAdjustAlignment(nav);
      moveNavElliptically(nav);
    });
    
    storeMenuState('closed');
  }

  function retainMenuState(nestedContainer, closeIcon) {
    if (window.innerWidth <= 767) return;

    const savedState = localStorage.getItem('menuState');
    if (savedState === 'open') {
      openMenu(nestedContainer, closeIcon);
    } else {
      closeMenu(nestedContainer, closeIcon);
    }
  }

  function storeMenuState(state) {
    localStorage.setItem('menuState', state);
  }

  function handleScreenResize() {
    const nav = document.querySelector(".nav");
    const dragHandles = [document.querySelector(".menu-wrap"), document.querySelector(".nested-container")];
    const toggleButton = document.querySelector(".toggle-button");
    const nestedContainer = document.querySelector(".nested-container");
    const closeIcon = document.querySelector(".close-icon");

    toggleTransition(nav, false);

    if (window.innerWidth > 767) {
      restoreNavPosition(nav);
      retainMenuState(nestedContainer, closeIcon);
      makeElementDraggable(dragHandles, nav);

      dragHandles.forEach(handle => {
        handle.style.cursor = 'grab';
      });

      toggleButton.onclick = function(event) {
        event.stopPropagation();
        if (isMenuOpen) {
          closeMenu(nestedContainer, closeIcon);
        } else {
          openMenu(nestedContainer, closeIcon);
        }
      };
    } else {
      resetNavPosition(nav);
      closeMenu(nestedContainer, closeIcon);
      cancelAnimationFrame(movementAnimation);
    }
    checkAndAdjustAlignment(nav);

    setTimeout(() => {
      toggleTransition(nav, true);
    }, 50);
  }

  const debouncedHandleScreenResize = debounce(handleScreenResize, 250);

  handleScreenResize();

  window.addEventListener('resize', debouncedHandleScreenResize);
});
