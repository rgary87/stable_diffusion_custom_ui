function createLoadingImage() {
    const existingElement = document.getElementById('loadingDiv');
    if (existingElement !== null) {
        return existingElement;
    }
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingDiv';
    loadingDiv.classList = 'd-flex align-items-center justify-content-center';
    const spinner = document.createElement('div');
    spinner.classList = 'spinner-border text-primary';
    spinner.setAttribute('role', 'status');
    // const spanLoading = document.createElement('span');
    // spanLoading.classList = 'visually-hidden';
    // spanLoading.textContent = 'Loading...';
    // spinner.appendChild(spanLoading);
    loadingDiv.appendChild(spinner);
    return loadingDiv;
}

function downloadImage(id) {
    // Get the base64-encoded image data
    var imageBase64 = document.getElementById(id).getAttribute('src').replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    // Convert the base64-encoded data to a Blob object
    var blob = b64toBlob(imageBase64, 'image/jpeg');

    // Create a temporary <a> element and click it to initiate the download
    var link = document.createElement('a');
    link.download = id + '.jpg'; // Set the file name for the download
    link.href = window.URL.createObjectURL(blob);
    link.click();
}

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

function clearImages() {
    const imagesBlock = document.getElementById('images');
    while (imagesBlock.firstChild) {
        imagesBlock.removeChild(imagesBlock.firstChild);
    }
}

function randomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}