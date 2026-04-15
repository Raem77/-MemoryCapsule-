   ///////////////////////-------------------- SCENE DATA -------------------////////////////////////


    const items = {


      bed: {
        tag:   'Rest',                     // ← small label
        title: 'The Bed',                  // ← change
        desc:  'Where sleep and memory blur — the site of dreams, illness, recovery, and the long hours of just lying there.',  // ← change
        link:  'http://hca.gilead.org.il'  // ← change
      },


      desk: {
        tag:   'Archive',
        title: 'The Desk',
        desc:  'A surface of accumulated layers — the nostalgic interface between thought and record.',
        link:  'https://www.are.na/micah-barrett/nostalgic-interfaces'
      },


      wall: {
        tag:   'Image',
        title: 'GG',
        desc:  'good game',
        link:  'https://www.are.na/micah-barrett/nostalgic-interfaces'
      },


      window: {
        tag:   'Light',
        title: 'The Window',
        desc:  'Every window is a found image. The light changes and so does everything it touches — sunset after sunset.',
        link:  'http://www.penelopeumbrico.net/index.php/project/sunset-portraits/'
      },


      book: {
        tag:   'Text',
        title: 'The Book',
        desc:  'A book left open is a sign of interrupted time — someone was here, reading, and then suddenly wasn\'t.',
        link:  'https://youtu.be/OdoFrTpeMWo?si=EuwuO-hFpaYcgydy'
      },


      easel: {
        tag:   'Colour',
        title: 'The Easel',
        desc:  'Colour as memory — the residue of an afternoon, a feeling approximated in pigment.',
        link:  'https://www.port-magazine.com/art-photography/the-colour-of-memory/'
      }


    };




    // Scene caption names — one string per scene, in order
    // ← change these to match your photo labels
    const sceneNames = [
      'Welcome',
      'The full room',
      'A step closer',
      'Nap time',
      'Crafting table',
    ];


    // tracks which scene is currently visible
    let current = 0;




    ///////////////////////-------------------- SCENE NAVIGATION -------------------////////////////////////


    function goTo(index) {


      // hide current scene
      document.getElementById('scene-' + current).classList.remove('active');
      current = index;
      // show new scene
      document.getElementById('scene-' + current).classList.add('active');


      // update progress pips
      document.querySelectorAll('.step-pip').forEach((p, i) => {
        p.classList.toggle('active', i === current);
      });


      // update caption row
      document.getElementById('sceneTag').textContent    = 'Position ' + (current + 1) + ' of 5';
      document.getElementById('captionNum').textContent  = String(current + 1).padStart(2, '0');
      document.getElementById('captionTitle').textContent = sceneNames[current];


    }




    ///////////////////////-------------------- MODAL -------------------////////////////////////


    function openModal(key) {
      const d = items[key];
      document.getElementById('modalTag').textContent    = d.tag;
      document.getElementById('modalTitle').textContent  = d.title;
      document.getElementById('modalDesc').textContent   = d.desc;
      document.getElementById('modalLink').href          = d.link;
      document.getElementById('modalOverlay').classList.add('active');
      document.getElementById('modal').classList.add('active');
      document.body.classList.add('modal-open');
    }


    function closeModal() {
      document.getElementById('modalOverlay').classList.remove('active');
      document.getElementById('modal').classList.remove('active');
      document.body.classList.remove('modal-open');
    }


    function closeModalOutside(e) {
      if (e.target === document.getElementById('modalOverlay')) closeModal();
    }




    ///////////////////////-------------------- INTRO SCREEN -------------------////////////////////////


    function enterRoom() {
      document.getElementById('intro-screen').classList.add('gone');
    }




    ///////////////////////-------------------- KEYBOARD CONTROLS -------------------////////////////////////


    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') goTo(Math.min(current + 1, 4));
      if (e.key === 'ArrowLeft')  goTo(Math.max(current - 1, 0));
      if (e.key === 'Escape')     closeModal();
    });



