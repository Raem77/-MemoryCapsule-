if (document.querySelector(".archive-container")) {

    const images = document.querySelectorAll(".image-wrapper");

    let topZ = 10;
    let activeDrag = null;
    let offsetX = 0;
    let offsetY = 0;
    let moved = false; // tracks if the mouse moved — prevents a drag from also triggering a click


    //////////-------------------  MODAL INFO PANEL -------------------/////////////////////////

    const modalInfo  = document.getElementById("modalInfo");
    const modalTitle = document.getElementById("modalTitle");
    const modalDate  = document.getElementById("modalDate");
    const modalDesc  = document.getElementById("modalDesc");

    // fills the info panel from the clicked image's data- attributes
    function showModalInfo(wrapper) {
        modalTitle.textContent = wrapper.dataset.title || "";
        modalDate.textContent  = wrapper.dataset.date  || "";
        modalDesc.textContent  = wrapper.dataset.desc  || "";
        modalInfo.classList.add("visible");
    }

    // hides and clears the info panel after the fade-out finishes
    function hideModalInfo() {
        modalInfo.classList.remove("visible");
        setTimeout(() => {
            modalTitle.textContent = "";
            modalDate.textContent  = "";
            modalDesc.textContent  = "";
        }, 300); // matches the CSS transition duration
    }

    const overlay          = document.getElementById("overlay");
    const archiveContainer = document.querySelector(".archive-container");
    let movedWrapper        = null;
    let originalParent      = null;
    let originalNextSibling = null;


    //////////-------------------  DRAG + CLICK -------------------/////////////////////////

    images.forEach(wrapper => {

        wrapper.addEventListener("mousedown", function (e) {
            moved = false;
            topZ++;
            wrapper.style.zIndex = topZ;
            activeDrag = wrapper;
            offsetX = e.clientX - wrapper.offsetLeft; // distance from cursor to image edge
            offsetY = e.clientY - wrapper.offsetTop;
            e.preventDefault(); // stops text selection while dragging
        });

        wrapper.addEventListener("click", function () {
            if (moved) return; // was a drag — ignore

            // close any other open image first
            images.forEach(img => {
                if (img !== wrapper) img.classList.remove("expanded");
            });

            wrapper.style.left = "";
            wrapper.style.top  = "";
            wrapper.classList.toggle("expanded");

            if (wrapper.classList.contains("expanded")) {
                topZ++;
                wrapper.style.zIndex = topZ;
                overlay.classList.add("active");
                archiveContainer.classList.add("blurred");
                document.body.classList.add("modal-open");

                // save position in the DOM so we can return the image on close
                originalParent      = wrapper.parentNode;
                originalNextSibling = wrapper.nextSibling;

                document.body.appendChild(wrapper);
                movedWrapper = wrapper;
                showModalInfo(wrapper);

            } else {
                overlay.classList.remove("active");
                archiveContainer.classList.remove("blurred");
                document.body.classList.remove("modal-open");
                returnWrapper();
                hideModalInfo();
            }

            activeDrag = null;
        });
    });

    // returns the expanded image to its original position in the DOM
    function returnWrapper() {
        if (movedWrapper && originalParent) {
            originalParent.insertBefore(movedWrapper, originalNextSibling);
        }
        movedWrapper        = null;
        originalParent      = null;
        originalNextSibling = null;
    }

    document.addEventListener("mousemove", function (e) {
        if (!activeDrag) return;
        moved = true;
        activeDrag.style.left = (e.clientX - offsetX) + "px";
        activeDrag.style.top  = (e.clientY - offsetY) + "px";
    });

    document.addEventListener("mouseup", function () {
        activeDrag = null;
    });


    //////////-------------------  CLOSE + NAVIGATION -------------------/////////////////////////

    // eye icon — back to boxes page
    const resetEye = document.getElementById("resetEye");
    resetEye.addEventListener("click", function () {
        window.location.href = "index.html";
    });

    // click outside expanded image — close modal
    document.addEventListener("click", function (e) {
        const expanded = document.querySelector(".image-wrapper.expanded");
        if (!expanded) return;

        const clickedInsideImage = e.target.closest(".image-wrapper");
        if (clickedInsideImage === expanded) return;

        expanded.style.left = expanded.dataset.savedLeft || "";
        expanded.style.top  = expanded.dataset.savedTop  || "";
        expanded.classList.remove("expanded");
        overlay.classList.remove("active");
        archiveContainer.classList.remove("blurred");
        document.body.classList.remove("modal-open");
        returnWrapper();
        hideModalInfo();
    });

    // click dim overlay — close modal
    overlay.addEventListener("click", function () {
        const expanded = document.querySelector(".image-wrapper.expanded");
        if (!expanded) return;
        expanded.classList.remove("expanded");
        overlay.classList.remove("active");
        archiveContainer.classList.remove("blurred");
        document.body.classList.remove("modal-open");
        returnWrapper();
        hideModalInfo();
    });

}


if (document.getElementById("createBoxBtn")) {

    ///////////////////---- BOX ZOOM -------------------//////////////////////

    const boxes       = document.querySelectorAll('.box');
    const zoomOverlay = document.getElementById('zoomOverlay');

    boxes.forEach(box => {
        box.addEventListener('click', function () {
            const destination = this.dataset.href;
            if (!destination) return; // scroll boxes have no data-href — skip

            const rect    = this.getBoundingClientRect();
            const centerX = rect.left + rect.width  / 2;
            const centerY = rect.top  + rect.height / 2;

            // zoom erupts from the center of the clicked box
            zoomOverlay.style.transformOrigin = `${centerX}px ${centerY}px`;
            zoomOverlay.classList.add('zooming');

            // navigate after the animation finishes
            zoomOverlay.addEventListener('animationend', () => {
                window.location.href = destination;
            }, { once: true }); // { once: true } removes the listener after it fires
        });
    });

    // scroll boxes — smoothly scroll to their section
    const scrollBoxes = document.querySelectorAll('.box--scroll');
    scrollBoxes.forEach(box => {
        box.addEventListener('click', function () {
            const targetId = this.dataset.target;
            document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
        });
    });


    ///////////////////---- ABOUT PANEL -------------------//////////////////////

    const aboutBtn        = document.getElementById('aboutBtn');
    const aboutPanel      = document.getElementById('aboutPanel');
    const aboutPanelClose = document.getElementById('aboutPanelClose');
    const aboutOverlay    = document.getElementById('aboutOverlay');

    function openPanel() {
        aboutPanel.classList.add('open');
        aboutOverlay.classList.add('active');
    }

    function closePanel() {
        aboutPanel.classList.remove('open');
        aboutOverlay.classList.remove('active');
    }

    aboutBtn.addEventListener('click', openPanel);
    aboutPanelClose.addEventListener('click', closePanel);
    aboutOverlay.addEventListener('click', closePanel);


    ///////////////////---- SECTION LABEL -------------------//////////////////////

    const sectionLabel = document.getElementById('sectionLabel');

    if (sectionLabel) {

        const sectionLabels = {
            'fragments-section': 'Fragments\nYour text here',
            'words-section':     'Words of Affirmation\nYour text here',
            'photos-section':    'Photos\nYour text here'
        };

        const scrollSections = document.querySelectorAll('.scroll-section');

        // fires whenever a section enters or leaves the viewport
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    sectionLabel.innerHTML = sectionLabels[entry.target.id].replace(/\n/g, '<br>');
                    sectionLabel.classList.add('visible');
                }
            });

            // hide label if no section is on screen
            const anyVisible = [...scrollSections].some(s => {
                const rect = s.getBoundingClientRect();
                return rect.top < window.innerHeight && rect.bottom > 0;
            });
            if (!anyVisible) sectionLabel.classList.remove('visible');

        }, { threshold: 0.1 }); // fires when 10% of the section is visible

        scrollSections.forEach(s => sectionObserver.observe(s));
    }


    ///////////////////---- CREATE YOUR OWN BOX -------------------//////////////////////

    const createBoxBtn     = document.getElementById('createBoxBtn');
    const createBoxModal   = document.getElementById('createBoxModal');
    const createBoxOverlay = document.getElementById('createBoxOverlay');
    const createBoxClose   = document.getElementById('createBoxClose');
    const userBoxesGrid    = document.getElementById('userBoxesGrid');
    const userBoxesEmpty   = document.getElementById('userBoxesEmpty');

    const viewBoxModal   = document.getElementById('viewBoxModal');
    const viewBoxOverlay = document.getElementById('viewBoxOverlay');
    const viewBoxClose   = document.getElementById('viewBoxClose');
    const viewBoxTitle   = document.getElementById('viewBoxTitle');
    const viewBoxGallery = document.getElementById('viewBoxGallery');
    const viewBoxImg     = document.getElementById('viewBoxImg');

    let selectedBox  = null;
    let uploadedImgs = [];


    // ---- OPEN / CLOSE CREATE MODAL ----

    function openCreateModal() {
        createBoxModal.classList.add('active');
        createBoxOverlay.classList.add('active');
        goToStep(1); // always start at step 1
    }

    // resets the modal so it's clean on next open
    function closeCreateModal() {
        createBoxModal.classList.remove('active');
        createBoxOverlay.classList.remove('active');
        selectedBox  = null;
        uploadedImgs = [];
        document.getElementById('boxNameInput').value = '';
        document.getElementById('uploadPreviews').innerHTML = '';
        document.querySelectorAll('.box-option').forEach(o => o.classList.remove('selected'));
    }

    createBoxBtn.addEventListener('click', openCreateModal);
    createBoxClose.addEventListener('click', closeCreateModal);
    createBoxOverlay.addEventListener('click', closeCreateModal);

    // hides all steps then shows only step n
    function goToStep(n) {
        document.querySelectorAll('.modal-step').forEach(s => s.classList.add('hidden'));
        document.getElementById('step' + n).classList.remove('hidden');
    }


    // ---- OPEN / CLOSE VIEW MODAL ----

    function openViewModal(data) {
        viewBoxTitle.textContent = data.name;
        viewBoxImg.src = `boxes/box${data.box}-open.png`;

        viewBoxGallery.innerHTML = data.images.length
            ? data.images.map(img => `<img src="${img}" class="view-memory-img" alt="memory">`).join('')
            : '<p class="view-box-empty">No images in this box.</p>';

        viewBoxModal.classList.add('active');
        viewBoxOverlay.classList.add('active');
    }

    function closeViewModal() {
        viewBoxModal.classList.remove('active');
        viewBoxOverlay.classList.remove('active');
        setTimeout(() => { viewBoxGallery.innerHTML = ''; }, 300); // clear after fade
    }

    viewBoxClose.addEventListener('click', closeViewModal);
    viewBoxOverlay.addEventListener('click', closeViewModal);


    // ---- CREATE MODAL STEPS ----

    // step 1 — pick a box drawing
    document.querySelectorAll('.box-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.box-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            selectedBox = this.dataset.box;
            setTimeout(() => goToStep(2), 300); // brief delay so selection is visible
        });
    });

    // step 2 — name the box
    document.getElementById('toStep3').addEventListener('click', () => {
        const name = document.getElementById('boxNameInput').value.trim();
        if (!name) {
            document.getElementById('boxNameInput').focus();
            return;
        }
        goToStep(3);
    });

    // step 3 — upload images
    // images are compressed before storing —> shrinks a 2MB photo to ~100KB
    // so more images fit within localStorage's 5MB limit
    document.getElementById('fileInput').addEventListener('change', function () {
        Array.from(this.files).forEach(file => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX    = 800; // max dimension in px

                    // scale down proportionally — never scale up a small image
                    const scale    = Math.min(1, MAX / Math.max(img.width, img.height));
                    canvas.width   = img.width  * scale;
                    canvas.height  = img.height * scale;

                    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

                    const compressed = canvas.toDataURL('image/jpeg', 0.7); // 70% quality

                    uploadedImgs.push(compressed);

                    const thumb = document.createElement('img');
                    thumb.src       = compressed;
                    thumb.className = 'memory-thumb';
                    document.getElementById('uploadPreviews').appendChild(thumb);
                };

                img.src = e.target.result;
            };

            reader.readAsDataURL(file);
        });
    });

    // save — builds the box object and writes it to localStorage
    document.getElementById('saveBox').addEventListener('click', () => {
        const name = document.getElementById('boxNameInput').value.trim();
        if (!selectedBox || !name) return;

        const boxData = {
            id:     Date.now(),  // always unique
            box:    selectedBox,
            name:   name,
            images: uploadedImgs
        };

        try {
            const existing = JSON.parse(localStorage.getItem('userBoxes') || '[]');
            existing.push(boxData);
            localStorage.setItem('userBoxes', JSON.stringify(existing));
        } catch (e) {
            alert('Could not save — storage is full. Try uploading smaller images.');
            return;
        }

        renderUserBox(boxData);
        closeCreateModal();
    });


    // ------------ RENDER A SAVED BOX CARD ----------

    function renderUserBox(data) {
        userBoxesEmpty.style.display = 'none';

        const box = document.createElement('div');
        box.className  = 'user-box';
        box.dataset.id = data.id;

        const count = data.images.length;

        box.innerHTML = `
            <div class="user-box-images">
                <img src="boxes/box${data.box}-closed.png" class="user-box-closed" alt="closed">
                <img src="boxes/box${data.box}-open.png"   class="user-box-open"   alt="open">
            </div>
            <span class="user-box-label">${data.name}</span>
            <span class="user-box-count">${count} item${count !== 1 ? 's' : ''}</span>
            <button class="user-box-delete" title="Delete box">×</button>
        `;

        box.addEventListener('mouseenter', () => box.querySelector('.user-box-open').classList.add('visible'));
        box.addEventListener('mouseleave', () => box.querySelector('.user-box-open').classList.remove('visible'));

        box.addEventListener('click', (e) => {
            if (e.target.classList.contains('user-box-delete')) return;
            openViewModal(data);
        });

        box.querySelector('.user-box-delete').addEventListener('click', (e) => {
            e.stopPropagation(); // don't also open the view modal
            deleteUserBox(data.id, box);
        });

        userBoxesGrid.appendChild(box);
    }


    // ---- DELETE A BOX ----

    function deleteUserBox(id, cardEl) {
        const all     = JSON.parse(localStorage.getItem('userBoxes') || '[]');
        const updated = all.filter(b => b.id !== id);
        localStorage.setItem('userBoxes', JSON.stringify(updated));

        cardEl.style.transition = 'opacity 0.2s ease';
        cardEl.style.opacity    = '0';
        setTimeout(() => {
            cardEl.remove();
            if (updated.length === 0) userBoxesEmpty.style.display = 'block';
        }, 200);
    }


    // ---- LOAD SAVED BOXES ON PAGE LOAD ----

    // reads localStorage and re-renders saved boxes — persists across page refreshes
    function loadSavedBoxes() {
        const saved = JSON.parse(localStorage.getItem('userBoxes') || '[]');
        saved.forEach(renderUserBox);
    }

    loadSavedBoxes();

}