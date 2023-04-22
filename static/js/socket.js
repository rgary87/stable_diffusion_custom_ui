var socket = io.connect(window.location.href);
var current_to_gen = 0;
socket.on('open', function (event) {
    console.log("WebSocket connected");
});
socket.on('close', function (event) {
    console.log("WebSocket closed");
});
socket.on('error', function (event) {
    console.log("WebSocket error: ${event}");
});
socket.on('message', function (message) {
    if (message.image != '') {
        displayImage(message.image, message.image_seed)
    }
    updateQueueLength(message.queue_length)
});

function sendMessage(prompt, negative, seed, step_count, generate_count, width, heigth) {
    var prompt = prompt || document.getElementById("prompt").value;
    var negative = negative || document.getElementById("negative").value;
    if (document.getElementById('basicNeg').checked) {
        negative += ', disfigured, kitschy, ugly, oversaturated, low-res, deformed, blurry, extra lib, too many fingers'
    }
    var seed = seed || document.getElementById("seed").value;
    var width = width || document.getElementById("width").value;
    var heigth = heigth || document.getElementById("heigth").value;
    var step_count = step_count || document.getElementById("step-count").value;
    var generate_count = generate_count || document.getElementById("generator-count").value;
    current_to_gen = generate_count;
    socket.emit("message", JSON.stringify(
        {
            "prompt": prompt,
            "negative": negative,
            "seed": seed,
            "step_count": step_count,
            "generate_count": generate_count,
            "width": width,
            "heigth": heigth,
        }
    ));
    displayLoading(createLoadingImage());
}

function displayLoading(loadingDiv) {
    // Add loading animation if needed
    if (loadingDiv != null && loadingDiv.parentNode != null) {
        loadingDiv.parentNode.removeChild(loadingDiv);
    }
    if (current_to_gen > 0) {
        document.getElementById('loading_space').appendChild(loadingDiv);
    }
}

function displayImage(message_image, message_seed) {
    message_seed = message_seed || '' + Math.floor(Math.random() * 999999999);
    var imageb64 = 'data:image/jpeg;base64,' + message_image;
    current_to_gen -= 1;

    const imagesBlock = document.getElementById('images');

    const imageDivTag = document.createElement('div');
    const imageLink = document.createElement('a');
    const imageTag = document.createElement('img');
    const imageSeedText = document.createElement('p');
    imageDivTag.classList = 'displayImage';
    imageLink.appendChild(imageTag)
    imageDivTag.appendChild(imageLink);
    imageDivTag.appendChild(imageSeedText);
    if (imagesBlock.firstChild) {
        imagesBlock.insertBefore(imageDivTag, imagesBlock.firstChild);
    } else {
        imagesBlock.appendChild(imageDivTag)
    }

    imageLink.onclick = () => downloadImage(message_seed);
    imageLink.href = '#';
    imageTag.src = imageb64;
    imageTag.id = message_seed
    imageTag.style = 'margin: 2px';
    imageSeedText.innerHTML = message_seed + '<a href="#"><i class="bi bi-arrow-counterclockwise" onclick="reprocess('+message_seed+')"></i></a>'
    imageSeedText.classList = 'displaySeed';

    displayLoading(createLoadingImage())
}

function updateQueueLength(l) {
    var divQueueInfoSpan = document.getElementById('queue_length_info_span');
    divQueueInfoSpan.textContent = "Messages in queue: " + l;
    current_to_gen = l
}

function clearGenQueue() {
    socket.emit("clear")
}