document.addEventListener("DOMContentLoaded", function () {
    // Declare DOM elements needed for interaction
    const lessonContainer = document.getElementById("lessonContainer");
    const progressBar = document.getElementById("progressBar");
    const nextButton = document.getElementById("nextButton");
    const codeEditor = document.getElementById("codeEditor");
    const outputFrame = document.getElementById("outputFrame");
    const runCodeButton = document.getElementById("runCode");
    const clearCodeButton = document.getElementById("clearCode");
    const toggleChatbotButton = document.getElementById("toggleChatbot");
    const chatbotPopup = document.getElementById("chatbotPopup");
    const closeChatbotButton = document.getElementById("closeChatbot");

    // Sample lessons data
    const lessons = [
        {
            id: 1,
            title: "Introduction to Text Generation",
            subLessons: [
                {
                    sequence: [
                        { type: "content", data: { title: "Lesson 1.1: What is Text Generation?", paragraphs: ["Text Generation is a process in artificial intelligence where algorithms create human-like text based on specific input.", "It is used in various applications like chatbots, automated content creation, and more."] }},
                        { type: "quiz", data: { question: "What is Text Generation?", options: ["Text Creation", "Text Analysis", "Text Generation"], answer: 2 }},
                        { type: "video", data: { url: {mp4: "assets/aicooks.mp4", webm: "assets/steps.webm", ogv: "assets/steps.ogv"}, title: "Introduction to Text Generation" }},
                        { type: "drag-and-drop", data: { question: "Match the terms", items: [{ id: 1, text: "AI" }, { id: 2, text: "Text Generation" }], targets: [{ id: 1, label: "Artificial Intelligence" }, { id: 2, label: "Generating Human-like Text" }] }},
                        { type: "iframe", data: { url: "https://www.youtube.com/embed/-nhXrZY44z4", title: "Interactive Text Generation Tool" }}
                    ]
                }
            ]
        }
    ];

    let currentLesson = 0;
    let currentSubLesson = 0;
    let userAnswers = {}; // Track user answers
    let quizErrorDisplayed = false; // Flag to check if error is displayed

    // Initialize CodeMirror on the textarea for the code editor
    const editor = CodeMirror.fromTextArea(codeEditor, {
        mode: "htmlmixed", // Supports mixed HTML, CSS, and JS
        theme: "material", // Theme for the editor
        lineNumbers: true, // Show line numbers
        tabSize: 4, // Number of spaces per tab
        indentUnit: 4, // Indentation level
        indentWithTabs: false // Use spaces instead of tabs for indentation
    });

    // Load the first lesson
    loadLesson(currentLesson, currentSubLesson);

    // Function to load a lesson and sub-lesson by index
    function loadLesson(lessonIndex, subLessonIndex) {
        if (lessonIndex < 0 || lessonIndex >= lessons.length) return;
        const lesson = lessons[lessonIndex];
        const subLesson = lesson.subLessons[0];
        if (!subLesson) return;

        const sequence = subLesson.sequence;
        if (subLessonIndex < 0 || subLessonIndex >= sequence.length) return;

        const step = sequence[subLessonIndex];
        renderContent(step);

        // Update the progress bar
        updateProgressBar();

        // Show the next button if this is not the last step
        nextButton.style.display = (subLessonIndex === sequence.length - 1) ? "none" : "inline-block";
    }

    // Function to render content based on type
    function renderContent(step) {
        const data = step.data;
        switch (step.type) {
            case "content":
                lessonContainer.innerHTML = `
                    <div class="lesson-content">
                        <h2>${data.title}</h2>
                        ${data.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('')}
                    </div>
                `;
                break;
            case "quiz":
                lessonContainer.innerHTML = `
                    <div class="lesson-content">
                        <h2>${data.question}</h2>
                    </div>
                    <div class="quiz-section">
                        ${data.options.map((option, idx) => `
                            <div class="quiz-option">
                                <input type="radio" name="quizOption" id="option${idx}" value="${idx}">
                                <label for="option${idx}">${option}</label>
                            </div>
                        `).join('')}
                        <button id="submitQuiz" class="editor-button">Submit</button>
                        <div id="quizResult" style="display: none;"></div>
                    </div>
                `;
                quizErrorDisplayed = false; // Reset the flag
                break;
            case "video":
                lessonContainer.innerHTML = `
                    <div class="lesson-content">
                        <h2>${data.title}</h2>
                        <video width="600" height="400" controls>
                            ${data.url.mp4 ? `<source src="${data.url.mp4}" type="video/mp4">` : ''}
                            ${data.url.webm ? `<source src="${data.url.webm}" type="video/webm">` : ''}
                            ${data.url.ogv ? `<source src="${data.url.ogv}" type="video/ogv">` : ''}
                            Your browser does not support the video tag.
                        </video>
                    </div>
                `;
                break;
            case "drag-and-drop":
                lessonContainer.innerHTML = `
                    <div class="lesson-content">
                        <h2>${data.question}</h2>
                        <div id="dragDropContainer">
                            ${data.items.map(item => `<div class="draggable" draggable="true" data-id="${item.id}">${item.text}</div>`).join('')}
                            ${data.targets.map(target => `<div class="drop-target" data-id="${target.id}">${target.label}</div>`).join('')}
                        </div>
                    </div>
                `;
                initializeDragAndDrop();
                break;
            case "iframe":
                lessonContainer.innerHTML = `
                    <div class="lesson-content">
                        <h2>${data.title}</h2>
                        <iframe src="${data.url}" width="600" height="400" frameborder="0" allowfullscreen></iframe>
                    </div>
                `;
                break;
            default:
                console.error(`Unknown step type: ${step.type}`);
        }
    }

    // Initialize drag-and-drop functionality
    function initializeDragAndDrop() {
        const draggables = document.querySelectorAll('.draggable');
        const dropTargets = document.querySelectorAll('.drop-target');

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.id);
            });
        });

        dropTargets.forEach(target => {
            target.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            target.addEventListener('drop', (e) => {
                e.preventDefault();
                const itemId = e.dataTransfer.getData('text/plain');
                const draggable = document.querySelector(`.draggable[data-id="${itemId}"]`);
                if (draggable) {
                    target.appendChild(draggable);
                }
            });
        });
    }

    // Function to update the progress bar
    function updateProgressBar() {
        const sequenceLength = lessons[currentLesson].subLessons[0].sequence.length;
        const progressPercent = ((currentSubLesson + 1) / sequenceLength) * 100; // Calculate the progress
        progressBar.style.width = `${progressPercent}%`; // Update the progress bar width
    }

    // Function to check if the current step is completed
    function isStepCompleted(step) {
        switch (step.type) {
            case "quiz":
                const selectedOption = document.querySelector('input[name="quizOption"]:checked');
                return selectedOption !== null;
            case "drag-and-drop":
                const draggables = document.querySelectorAll('.draggable');
                const dropTargets = document.querySelectorAll('.drop-target');
                return Array.from(draggables).every(draggable => {
                    return Array.from(dropTargets).some(target => {
                        return target.contains(draggable);
                    });
                });
            default:
                return true;
        }
    }

    // Event listener for the "Next" button
    nextButton.addEventListener("click", function () {
        const step = lessons[currentLesson].subLessons[0].sequence[currentSubLesson];
        if (isStepCompleted(step)) {
            const subLessonSequenceLength = lessons[currentLesson].subLessons[0].sequence.length;
            if (currentSubLesson < subLessonSequenceLength - 1) {
                currentSubLesson++; // Increment the sub-lesson index
                loadLesson(currentLesson, currentSubLesson); // Load the next step
            } else if (currentLesson < lessons.length - 1) {
                currentLesson++; // Increment the lesson index
                currentSubLesson = 0; // Reset sub-lesson index
                loadLesson(currentLesson, currentSubLesson); // Load the first step of the next lesson
            } else {
                // End of lessons, show scoreboard
                showScoreboard();
            }
        } else {
            if (!quizErrorDisplayed) {
                displayErrorMessage("Please complete the current activity before proceeding.");
                quizErrorDisplayed = true; // Set the flag to true
            }
        }
    });

    // Function to show scoreboard
    function showScoreboard() {
        lessonContainer.innerHTML = `
            <h2>Scoreboard</h2>
            <p>Congratulations! You've completed all lessons.</p>
            <!-- You can add more detailed score information here -->
        `;
        nextButton.style.display = 'none'; // Hide next button
    }

    // Function to display error message within the lesson area
    function displayErrorMessage(message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message;
        lessonContainer.appendChild(errorMessage);
    }

    // Event listener for the "Run Code" button
    runCodeButton.addEventListener("click", function () {
        runCodeButton.textContent = 'Running🏃‍♀️'; // Indicate that the code is running
        const code = editor.getValue(); // Get the code from the editor
        outputFrame.srcdoc = code; // Set the code as the content of the output frame
        setTimeout(() => {
            runCodeButton.textContent = 'Run Code'; // Reset the button text after 2 seconds
        }, 1000);
    });

    // Event listener for the "Clear Code" button
    clearCodeButton.addEventListener("click", function () {
        editor.setValue(''); // Clear the editor
        outputFrame.srcdoc = 'Your results will be displayed here...'; // Reset the output frame
    });

    // Event listener for quiz submission
    document.addEventListener('click', function (event) {
        if (event.target.id === 'submitQuiz') {
            const selectedOption = document.querySelector('input[name="quizOption"]:checked'); // Get the selected option
            const resultContainer = document.getElementById('quizResult');
            const step = lessons[currentLesson].subLessons[0].sequence[currentSubLesson];
            const options = document.querySelectorAll('input[name="quizOption"]');
            const correctIndex = step.data.answer; // Get the correct answer index

            // If an option is selected
            if (selectedOption) {
                const selectedIndex = parseInt(selectedOption.value, 10); // Convert the value to an integer
                
                // Highlight the correct and incorrect answers
                options.forEach((option, idx) => {
                    const label = option.nextElementSibling;
                    if (idx === correctIndex) {
                        label.style.color = 'green'; // Correct answer
                    } else if (idx === selectedIndex) {
                        label.style.color = 'red'; // Incorrect answer
                    }
                    option.disabled = true; // Disable all options
                });

                event.target.disabled = true; // Disable the submit button

                // Display whether the selected answer was correct or incorrect
                if (selectedIndex === correctIndex) {
                    resultContainer.innerHTML = 'Correct!';
                } else {
                    resultContainer.innerHTML = 'Incorrect, try again.';
                }
                resultContainer.style.display = 'block';
            } else {
                // If no option is selected, prompt the user to choose an answer within the lesson area
                resultContainer.innerHTML = 'Please choose an answer.';
                resultContainer.style.display = 'block';
            }
        }
    });

    // Event listener to toggle the chatbot popup
    toggleChatbotButton.addEventListener("click", () => {
        chatbotPopup.style.display = chatbotPopup.style.display === 'block' ? 'none' : 'block';
    });

    // Event listener to close the chatbot popup
    closeChatbotButton.addEventListener("click", () => {
        chatbotPopup.style.display = 'none';
    });
});

loadLessonData('all-lessons/text-gen-cos.json'); // Call the function to load data when the script runs
