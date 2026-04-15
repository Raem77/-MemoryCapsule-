/* pano-script.js
   360° room tour — Pannellum multi-scene viewer
   -----------------------------------------------
   Structure:
   1. SCENE & HOTSPOT DATA    ← the only section you need to edit regularly
   2. CUSTOM HOTSPOT RENDERER — draws link hotspots without Pannellum's default icon
   3. MODAL REFERENCES        — DOM element handles
   4. MODAL OPEN / CLOSE      — show/hide the link preview modal
   5. SCENE BUILDER           — converts SCENES → Pannellum format
   6. PANNELLUM INIT          — starts the 360° viewer
   7. MODAL BUTTON EVENTS     — close, continue
*/


///////////////////////-------------------- 1. SCENE & HOTSPOT DATA -------------------////////////////////////

const SCENES = {

  // ------------------------------------- ENTRY -----------------------------------

  entry: {
    panorama: 'entry.jpg',
    label:    'Entry',
    hotspots: [

      { type: 'scene', scene: 'full_room', pitch: -60, yaw: -40, text: 'Enter' },

    ]
  },

  // ----------------------------------- FULL ROOM ------------------------------------

  full_room: {
    panorama: 'full_room.jpg',
    label:    'Full Room',
    hotspots: [

      { type: 'scene', scene: 'p1',    pitch: -60, yaw: -80, text: 'Forward' },
      { type: 'scene', scene: 'entry', pitch: -5,  yaw: 10,  text: 'Back' },

    ]
  },

  // ---------------------------- P1 ------------------------------

  p1: {
    panorama: 'p1.jpg',
    label:    'p1',
    hotspots: [

      { type: 'scene', scene: 'p2',        pitch: -60, yaw: 0,   text: 'Forward' },
      { type: 'scene', scene: 'full_room', pitch: -40, yaw: 180, text: 'Back' },

      // ← ADDED: bed (far left, yaw≈-138) — adjust yaw until sparkle lands on the bed
      { type: 'link', label: 'Hans Christian Andersen', url: 'http://hca.gilead.org.il', pitch: -40, yaw: -100, text: 'Hans Christian Andersen' },

      // ← ADDED: easel (center, yaw≈-14) — adjust yaw until sparkle lands on the easel
      { type: 'link', label: 'The Colour of Memory', url: 'https://www.port-magazine.com/art-photography/the-colour-of-memory/', pitch: -50, yaw: 60, text: 'The Colour of Memory' },

    ]
  },

  // ------------------------------ P2 --------------------------------------

  p2: {
    panorama: 'p2.jpg',
    label:    'p2',
    hotspots: [

      { type: 'scene', scene: 'p1',    pitch: -50, yaw: 50,  text: 'Back' },
      { type: 'scene', scene: 'entry', pitch: -5,  yaw: 8, text: 'Retsart' },

      // <- ADDED: laptop — are.na board (desk wraps to far left, yaw≈-150)
      { type: 'link', label: 'Nostalgic Interfaces', url: 'https://www.are.na/micah-barrett/nostalgic-interfaces', pitch: -30,  yaw: -50, text: 'Nostalgic Interfaces' },

      // <- ADDED: laptop — neal.fun (offset slightly from above so they don't overlap)
      { type: 'link', label: 'Internet Artifacts',   url: 'https://neal.fun/internet-artifacts/',                 pitch: -40, yaw: -60, text: 'Internet Artifacts' },

      // <- ADDED: decorated wall / photos (wall art at yaw≈-90)
      { type: 'link', label: 'Wall',             url: 'https://youtu.be/GLy4VKeYxD4',                                            pitch: 5,  yaw: -90,  text: 'Wall' },

      // <- ADDED: window (windows on the right at yaw≈111)
      { type: 'link', label: 'Sunset Portraits', url: 'http://www.penelopeumbrico.net/index.php/project/sunset-portraits/',       pitch: 12, yaw: -150,  text: 'Sunset Portraits' },

    ]
  },

};


///////////////////////-------------------- 2. CUSTOM HOTSPOT RENDERER -------------------////////////////////////

function createLinkHotspot(hotSpotDiv, args) {

  // tooltip span — label that appears on hover
  const buttonImg = document.createElement('img');
  buttonImg.src = 'buttons/sparkle.png'; 
  buttonImg.className = 'link-button';
  hotSpotDiv.appendChild(buttonImg);

}

///////////////////////-------------------- 3. MODAL REFERENCES -------------------////////////////////////

const modalOverlay  = document.getElementById('modalOverlay');
const linkModal     = document.getElementById('linkModal');
const modalClose    = document.getElementById('modalClose');
const modalLabel    = document.getElementById('modalLabel');
const modalUrlEl    = document.getElementById('modalUrl');
const modalFrame    = document.getElementById('modalFrame');
const modalFallback = document.getElementById('modalFallback');
const modalContinue = document.getElementById('modalContinue');

let activeUrl = '';


///////////////////////-------------------- 4. MODAL OPEN / CLOSE -------------------////////////////////////

function openModal(hotSpotDiv, args) {

  activeUrl = args.url;
  modalLabel.textContent = args.label;
  modalUrlEl.textContent = args.url;
  modalFallback.classList.remove('visible');
  modalFrame.src = '';
  modalFrame.src = args.url;

  modalFrame.onload = function () {
    try {
      const doc = modalFrame.contentDocument || modalFrame.contentWindow.document;
      if (!doc || doc.URL === 'about:blank') showFallback();
    } catch (e) {
      showFallback();
    }
  };

  linkModal.classList.add('open');
  modalOverlay.classList.add('active');

}

function showFallback() {
  modalFallback.classList.add('visible');
}

function closeModal() {
  linkModal.classList.remove('open');
  modalOverlay.classList.remove('active');
  modalFrame.src = '';
  activeUrl = '';
}


///////////////////////-------------------- 5. SCENE BUILDER -------------------////////////////////////

function buildScenes() {

  const out = {};

  for (const [id, scene] of Object.entries(SCENES)) {

    const hotSpots = scene.hotspots.map(hs => {

      if (hs.type === 'scene') {
        return {
          type:    'scene',
          sceneId: hs.scene,
          pitch:   hs.pitch,
          yaw:     hs.yaw,
          text:    hs.text,
        };
      }

      if (hs.type === 'link') {
        return {
          type:              'info',
          pitch:             hs.pitch,
          yaw:               hs.yaw,
          text:              hs.text,
          cssClass:          'link-spot',
          clickHandlerFunc:  openModal,
          clickHandlerArgs:  { url: hs.url, label: hs.label },
          createTooltipFunc: createLinkHotspot,   // <- ADDED: skip pannellum default blue ℹ icon
          createTooltipArgs: hs.text,
        };
      }

    });

    out[id] = {
      type:     'equirectangular',
      panorama: scene.panorama,
      hotSpots,
    };
  }

  return out;

}


///////////////////////-------------------- 6. PANNELLUM INIT -------------------////////////////////////

const viewer = pannellum.viewer('panorama', {

  default: {
    firstScene:        'entry',
    sceneFadeDuration: 800,
    autoLoad:          true,
    showControls:      true,
    showZoomCtrl:      false,
    compass:           false,
    hfov:              100,
  },

  scenes: buildScenes(),

});


///////////////////////-------------------- 7. MODAL BUTTON EVENTS -------------------////////////////////////

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

modalContinue.addEventListener('click', function () {
  if (activeUrl) {
    window.open(activeUrl, '_blank', 'noopener,noreferrer');
  }
  closeModal();
});

// ---- WELCOME MODAL POP (shows on page load) ----

const welcomeModal   = document.getElementById('welcomeModal');
const welcomeOverlay = document.getElementById('welcomeOverlay');
const welcomeClose   = document.getElementById('welcomeClose');
const welcomeEnter   = document.getElementById('welcomeEnter');

function closeWelcome() {
  welcomeModal.classList.remove('open');
  welcomeOverlay.classList.remove('active');
}

// show on load
welcomeModal.classList.add('open');
welcomeOverlay.classList.add('active');

// exit = x, enter ->, (outside modal)
welcomeClose.addEventListener('click', closeWelcome);
welcomeEnter.addEventListener('click', closeWelcome);
welcomeOverlay.addEventListener('click', closeWelcome);