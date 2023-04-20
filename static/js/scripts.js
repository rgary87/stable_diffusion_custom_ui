document.addEventListener('DOMContentLoaded', function () {
    const generatorCountInput = document.getElementById('generator-count');
    const generatorCountDisplay = document.getElementById('generator-count-display');
    generatorCountInput.addEventListener('input', () => {
        generatorCountDisplay.value = generatorCountInput.value;
    });
});

function reprocess(seed) {
    var prompt = document.getElementById("prompt").value;
    var negative = document.getElementById("negative").value;
    var step_count = document.getElementById("step-count").value;
    var width = document.getElementById("width").value;
    var heigth = document.getElementById("heigth").value;
    sendMessage(prompt, negative, seed, step_count, '1', width, heigth)
}
