const checkboxes = Array.from(document.querySelectorAll('input[name="animal"]'));
const imageHolder = document.getElementById('image-holder');

checkboxes.forEach(cb => {
  cb.addEventListener('change', () => {
    if (cb.checked) {
      checkboxes.forEach(other => { if (other !== cb) other.checked = false; });
      showAnimal(cb.value);
    } else {
      imageHolder.innerHTML = '<p class="muted">Choose an animal to see an image.</p>';
    }
  });
});

function showAnimal(animal) {
  const src = `/static/images/${animal}.svg`;
  imageHolder.innerHTML = `<img alt="${animal}" src="${src}" />`;
}

const form = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const result = document.getElementById('upload-result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!fileInput.files.length) {
    result.textContent = "Please choose a file first.";
    return;
  }
  const fd = new FormData();
  fd.append('file', fileInput.files[0]);
  const res = await fetch('/upload', { method: 'POST', body: fd });
  const data = await res.json();
  result.textContent = [
    `File name : ${data.filename}`,
    `File size : ${data.size_human} (${data.size_bytes} bytes)`,
    `MIME type : ${data.mimetype}`
  ].join('\\n');
});
