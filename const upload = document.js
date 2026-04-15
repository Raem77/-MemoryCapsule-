const upload = document.getElementById('photoUpload');
const preview = document.getElementById('previewImage');

upload.addEventListener('change', function() {
  const file = upload.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    preview.src = e.target.result;
  }

  reader.readAsDataURL(file);
});