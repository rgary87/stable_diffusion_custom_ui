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

function sendMessage(prompt, negative, seed, step_count, generate_count) {
    var prompt = prompt || document.getElementById("prompt").value;
    var negative = negative || document.getElementById("negative").value;
    if (document.getElementById('basicNeg').checked) {
        negative += ', disfigured, kitschy, ugly, oversaturated, low-res, deformed, blurry, extra lib, too many fingers'
    }
    var seed = seed || document.getElementById("seed").value;
    var step_count = step_count || document.getElementById("step-count").value;
    var generate_count = generate_count || document.getElementById("generator-count").value;
    current_to_gen = generate_count;
    socket.emit("message", JSON.stringify(
        {
            "prompt": prompt,
            "negative": negative,
            "seed": seed,
            "step_count": step_count,
            "generate_count": generate_count
        }
    ));

    var imagesBlock = document.getElementById('images');
    while (imagesBlock.firstChild) {
        imagesBlock.removeChild(imagesBlock.firstChild);
    }
    imagesBlock.appendChild(createLoadingImage());
}

function displayLoading(imagesBlock) {
    // Add loading animation if needed
    var loadingDiv = document.getElementById('loadingDiv');
    if (loadingDiv != null) {
        loadingDiv.parentNode.removeChild(loadingDiv);
    }
    if (current_to_gen > 0) {
        imagesBlock.appendChild(loadingDiv);
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
    imagesBlock.appendChild(imageDivTag)

    imageLink.onclick = () => downloadImage(message_seed);
    imageLink.href = '#';
    imageTag.src = imageb64;
    imageTag.id = message_seed
    imageTag.style = 'margin: 2px';
    imageSeedText.innerHTML = message_seed + '<a href="#"><i class="bi bi-arrow-counterclockwise" onclick="reprocess('+message_seed+')"></i></a>'
    imageSeedText.classList = 'displaySeed';

    displayLoading(imagesBlock)
}

function updateQueueLength(l) {
    var divQueueInfoDiv = document.getElementById('queue_length_info')
    while (divQueueInfoDiv.firstChild) {
        divQueueInfoDiv.removeChild(divQueueInfoDiv.firstChild)
    }
    var queueInfoSpan = document.createElement('span')
    queueInfoSpan.textContent = "Messages in queue: " + l;
    var clearQueueButton = document.createElement('button');
    clearQueueButton.type = "button";
    clearQueueButton.classList = "btn btn-outline-info";
    clearQueueButton.style = "margin-left: 5px;"
    clearQueueButton.onclick = () => {clearGenQueue()};
    clearQueueButton.textContent = "Clear"
    queueInfoSpan.appendChild(clearQueueButton);
    divQueueInfoDiv.appendChild(queueInfoSpan)
}

function clearGenQueue() {
    socket.emit("clear")
}