// static/app.js - Animal preview + Upload with Gemini output

document.addEventListener('DOMContentLoaded', () => {
  console.log("app.js loaded and DOMContentLoaded");

  // Attach animal radios
  const radios = document.querySelectorAll('input[name="animal"]');
  radios.forEach(r => {
    r.addEventListener('change', function() {
      const val = this.value;
      showAnimalImage(val);
    });
  });

  // Attach upload button
  const uploadBtn = document.getElementById('upload_btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', onUploadClick);
  } else {
    console.error("upload_btn not found");
  }
});

function showAnimalImage(name) {
  const container = document.getElementById('animal_preview');
  container.innerHTML = '';

  const img = document.createElement('img');
  img.className = 'animal-img';
  img.alt = name;

  const jpgUrl = `/static/images/${name}.jpg`;
  const svgUrl = `/static/images/${name}.svg`;

  img.onerror = () => {
    if (img.src.endsWith('.jpg')) {
      console.warn(`jpg missing, trying svg for ${name}`);
      img.src = svgUrl;
    } else {
      container.innerHTML = `<p style="color:red">No image found for ${name}</p>`;
    }
  };

  img.src = jpgUrl;
  container.appendChild(img);
}

async function onUploadClick() {
  const fileInput = document.getElementById('file_input');
  if (!fileInput.files.length) {
    alert('Choose a file first');
    return;
  }
  const file = fileInput.files[0];
  console.log("Uploading file:", file.name, file.type, file.size);

  const fd = new FormData();
  fd.append('file', file);

  document.getElementById('gemini_out').innerText = 'Uploading...';

  try {
    const resp = await fetch('/upload', { method: 'POST', body: fd });
    const data = await resp.json();
    console.log("Upload response:", data);

    document.getElementById('filename').innerText = data.name || '';
    document.getElementById('filesize').innerText = data.size_bytes ? `${data.size_bytes} bytes` : '';
    document.getElementById('filetype').innerText = data.type || '';

    if (data.gemini_caption) {
      document.getElementById('gemini_out').innerText = data.gemini_caption;
    } else if (data.gemini_summary) {
      document.getElementById('gemini_out').innerText = data.gemini_summary;
    } else if (data.gemini_error) {
      document.getElementById('gemini_out').innerText = 'Gemini error: ' + data.gemini_error;
    } else if (data.gemini_notice) {
      document.getElementById('gemini_out').innerText = data.gemini_notice;
    } else {
      document.getElementById('gemini_out').innerText = 'No Gemini output';
    }
  } catch (err) {
    console.error(err);
    document.getElementById('gemini_out').innerText = 'Upload failed: ' + err.message;
  }
}
