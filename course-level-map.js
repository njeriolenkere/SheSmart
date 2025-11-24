//Fetch and parse JSON Data
let lessons = [];
let currentSubLesson = 0;
let currentSequenceIndex = 0;
let currentLesson = null;
let currentScore = 0;
let correctAnswersInARow = 0;  // Number of correct answers in a row
let incorrectAnswersInARow = 0;  // Number of incorrect answers in a row
let currentLevel = 1; // Example: setting the current level to 1 for demonstration
///code editor
let editor;
let pyodide;


// Function to fetch and parse JSON data dynamically
async function loadLessonData(lessonFilePath) {
    try {
        const response = await fetch(lessonFilePath);
        lessons = await response.json();
        generateLevelMap(); // Generate the level map after loading the lessons
    } catch (error) {
        console.error('Error loading lesson data:', error);
    }
}




// Arrays containing motivational and encouraging messages
const positiveMessages = [
    "You are smashing it Girl! Keep going!",
    "Girl you're on fire! Awesome job!",
    "Great work! You're really nailing this!",
    "Fantastic! You're a quiz master!",
    "Job Well done! You're doing amazing!"
];

const encouragingMessages = [
    "Don't give up Girl! You can do it!",
    "Keep trying! You're almost there!",
    "Stay positive! You're learning!",
    "Don't lose hope! You'll get it next time!",
    "Hang in there! You're doing great!"
];
// Function to generate and display the level map
function generateLevelMap() {
    const levelMap = document.getElementById('level-map');
    levelMap.innerHTML = ''; // Clear any existing content

    lessons.forEach((lesson, index) => {
        const level = document.createElement('div'); // Create a new div for each level
        level.className = 'level'; // Add a CSS class for styling
        // Add different CSS classes based on the level's status
        if (index + 1 < currentLevel) {
            level.classList.add('completed'); // Level is completed
        } else if (index + 1 === currentLevel) {
            level.classList.add('active'); // Current active level
            level.onclick = () => startLesson(lesson.id); // Set click handler to start the lesson
            const icon = document.createElement('div');  // Create an icon for the active level
            icon.className = 'current-level-icon';
            icon.textContent = '!';  // Display an exclamation mark
            level.appendChild(icon);  // Append the icon to the level div
        } else {
            level.classList.add('inactive');   
            level.onclick = null;  // Remove click handler for inactive levels

        }
        // Create and append the title for each level
        const title = document.createElement('h3');
        title.textContent = `Level ${lesson.id}: ${lesson.title}`;
        level.appendChild(title);
        levelMap.appendChild(level); // Append the level div to the level map
    });
        // Update the UI to show the level map and hide other elements
        document.getElementById('course-heading').style.display = 'block';
        document.getElementById('level-map').style.display = 'block';
        document.getElementById('lesson-content').style.display = 'none';
        document.getElementById('scoreboard').style.display = 'none';
        document.getElementById('confetti-canvas').style.display = 'none';

        //reset body bg and main bg color to default
    document.getElementById('course-level-main').style.backgroundColor = '';
    document.getElementById('course-level-body').style.backgroundColor = '';
}
// Function to start a lesson based on its ID
function startLesson(lessonId) {
    currentLesson = lessons.find(l => l.id === lessonId);
    currentSubLesson = 0; // Start with the first sub-lesson
    currentSequenceIndex = 0;  // Start with the first item in the sequence
    currentScore = 0; // Reset the score
    correctAnswersInARow = 0;  // Reset consecutive correct answers counter
    incorrectAnswersInARow = 0;  // Reset consecutive incorrect answers counter

        // Hide the course heading, level map, scoreboard, and confetti canvas
    document.getElementById('course-heading').style.display = 'none';
    document.getElementById('level-map').style.display = 'none';
    document.getElementById('scoreboard').style.display = 'none';
    document.getElementById('confetti-canvas').style.display = 'none';
    // Show the content or quiz for the current sub-lesson
    showSubLesson();
}

function showSubLesson() {
    if (currentSubLesson < currentLesson.subLessons.length) {
        const subLesson = currentLesson.subLessons[currentSubLesson];
        if (currentSequenceIndex < subLesson.sequence.length) {
            const sequenceItem = subLesson.sequence[currentSequenceIndex];
            renderContent(sequenceItem);
        } else {
            // Move to the next sub-lesson if the sequence is complete
            currentSubLesson++;
            currentSequenceIndex = 0;
            showSubLesson(); // Recursively show the next sub-lesson
        }
    } else {
         // If all sub-lessons are completed, mark the lesson as complete
        completeLesson();
    }
}

function renderContent(sequenceItem) {
    switch (sequenceItem.type) {
        case "content":
            renderContentText(sequenceItem.data);
            break;
        case "code":
            renderCode(sequenceItem.data);
            break;
        case "challenge":
            renderCode(sequenceItem.data);
            break;
        case "quiz":
            renderQuiz(sequenceItem.data);
            break;
        case "video":
            renderVideo(sequenceItem.data);
            break;
        case "drag-and-drop":
            renderDragAndDrop(sequenceItem.data);
            break;
        case "iframe":
            renderIframe(sequenceItem.data);
            break;
        default:
            console.error(`Unknown content type: ${sequenceItem.type}`);
    }
}
//ALL TYPES
//content type
function renderContentText(content) {
    document.getElementById('lesson-title').textContent = content.title;
    document.getElementById('lesson-text').innerHTML = content.paragraphs.map(p => `<p>${p}</p>`).join('');
    
    // Check if an image is provided and display it
    const imageContainer = document.getElementById('lesson-image');
    if (content.image) {
        imageContainer.innerHTML = `<img src="${content.image}" alt="Lesson Image" style="max-width: 100%; height: auto;" />`;
        imageContainer.style.display = 'block'; // Show image if present
    } else {
        imageContainer.style.display = 'none'; // Hide image if not present
    }
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('drag-and-drop-container').style.display = 'none';
    document.getElementById('next-btn').textContent = 'Next';
    document.getElementById('next-btn').onclick = () => {
        currentSequenceIndex++;
        showSubLesson();
    };
    
    document.getElementById('feedback-message').textContent = '';  // Clear any previous feedback
    document.getElementById('lesson-content').style.display = 'block'; // Show the lesson content
    document.getElementById('next-btn').style.display = 'block'; // Show the next button

    document.getElementById('code-editor-container').style.display = 'none';
    document.getElementById('output-container').style.display = 'none';
    resetNextButton();
}

//code type
//clean the code
// Utility functions for cleaning code based on language
function cleanCode(code, language) {
    switch (language) {
        case 'css':
            return cleanCssCode(code);
        case 'htmlmixed':
            return cleanHtmlCode(code);
        case 'python':
            return cleanPythonCode(code);
        case 'javascript':
            return cleanJsCode(code);
        default: // Fallback to JavaScript mode if no specific cleaning function exists
            return cleanJsCode(code);
    }
}

function cleanCssCode(code) {
    return code
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove CSS comments
        .replace(/\s*:\s*/g, ':') // Remove spaces around colons
        .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
        .replace(/\s*}\s*/g, '}') // Remove spaces around closing brace
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .trim(); // Remove leading/trailing whitespace
}

function cleanHtmlCode(code) {
    return code
        .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .replace(/>\s+</g, '><') // Remove spaces between tags
        .trim(); // Remove leading/trailing whitespace
}
// Function to escape HTML characters
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
}
function cleanJsCode(code) {
    return code
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*/g, '') // Remove line comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
        .trim(); // Remove leading/trailing whitespace
}

function cleanPythonCode(code) {
    return code
        .replace(/#.*$/gm, '') // Remove Python comments
        .replace(/""".*?"""/gs, '') // Remove triple double-quoted strings (multiline comments)
        .replace(/'''.*?'''/gs, '') // Remove triple single-quoted strings (multiline comments)
        .replace(/\s+/g, ' ') // Normalize all whitespace to a single space
        .replace(/\s*:\s*/g, ':') // Remove spaces around colons
        .replace(/\s*{\s*/g, '{') // Remove spaces around opening braces
        .replace(/\s*}\s*/g, '}') // Remove spaces around closing braces
        .replace(/^\s*$/gm, '') // Remove empty lines
        .trim(); // Remove leading/trailing whitespace
}

// Function to get the mode from the language
function getModeFromLanguage(language) {
    switch (language) {
        case 'html':
            return 'htmlmixed'; // CodeMirror mode for HTML
        case 'js':
            return 'javascript'; // CodeMirror mode for JavaScript
        case 'css':
            return 'css'; // CodeMirror mode for CSS
        case 'python':
            return 'python'; // CodeMirror mode for Python
        default:
            return 'text'; // Fallback mode
    }
}


// Function to render the code snippet and initialize CodeMirror
function renderCode(codeData) {
    // Update lesson title
    document.getElementById('lesson-title').textContent = codeData.title;

    // Initialize attempts counter if it's a challenge
    if (codeData.challenge) {
        if (typeof codeData.attempts === 'undefined') {
            codeData.attempts = 0; // Initialize attempts counter
        }
    }

    // Render lesson paragraphs if available
    const lessonTextElement = document.getElementById('lesson-text');
    let paragraphHTML = '';
    if (codeData.paragraphs && codeData.paragraphs.length > 0) {
        paragraphHTML = codeData.paragraphs.map(p => `<p>${p}</p>`).join('');
    }
    lessonTextElement.innerHTML = paragraphHTML;

    // Get editor and output containers
    const codeEditorContainer = document.getElementById('code-editor-container');
    const outputContainer = document.getElementById('output-container');
    const runButton = document.getElementById('run-btn');
    const outputElement = document.getElementById('output');
    const nextButton = document.getElementById('next-btn');

    // Clear previous CodeMirror instance if any
    if (editor) {
        editor.toTextArea();
        editor = null;
    }

    // Initialize CodeMirror and set code based on type
    if (codeData.code || codeData.challenge) {
        codeEditorContainer.style.display = 'block';
        outputContainer.style.display = 'block';
        const mode = getModeFromLanguage(codeData.language);
        editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
            mode: mode,
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            autoCloseTags: true,
            styleActiveLine: true,
            theme: 'default'
        });

        // Set code in the editor
        editor.setValue(codeData.code || codeData.challenge);

        // Set up Run button based on lesson type
        if (codeData.code) { // Code lesson
            runButton.onclick = runCode;
            nextButton.style.display = 'block'; // Show Next button for code lessons
        } else if (codeData.challenge) { // Coding challenge
            runButton.onclick = function() {
                codeData.attempts++; // Increment attempts on each run
                handleChallenge(codeData);
            };
            nextButton.style.display = 'none'; // Hide Next button until needed
        }
    } else {
        // Hide editor and output if neither code nor challenge is present
        codeEditorContainer.style.display = 'none';
        outputContainer.style.display = 'none';
        runButton.style.display = 'none';
        nextButton.style.display = 'none'; // Hide Next button if no challenge
    }

    // Additional UI adjustments
    document.getElementById('lesson-content').style.display = 'block';
    document.getElementById('feedback-message').textContent = ''; // Clear feedback
    outputElement.innerHTML = ''; // Clear any existing content
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('drag-and-drop-container').style.display = 'none';
    document.getElementById('lesson-image').style.display = 'none';
    resetNextButton();
}

// Function to handle the coding challenge
function handleChallenge(codeData) {
    const userCode = editor.getValue().trim();
    const correctAnswer = codeData.answer ? codeData.answer.trim() : ''; // Access correctAnswer directly from codeData

    // Clean user code and correct answer
    const cleanedUserCode = cleanCode(userCode, codeData.language);
    const cleanedCorrectAnswer = cleanCode(correctAnswer, codeData.language);

    const outputElement = document.getElementById('output');
    const nextButton = document.getElementById('next-btn');

    if (cleanedUserCode === cleanedCorrectAnswer) {
        outputElement.textContent = "Correct! You get 10 points. 🎉";
        outputElement.style.color = 'green'; 
        playSound('correct'); // Play correct sound
        setNextButtonColor(true); // Call the global function with 'true' for correct answer
        currentScore += 10; // Award points for correct completion
        codeData.attempts = 0; // Reset attempts on correct answer
        nextButton.style.display = 'block'; // Show the Next button on correct answer
    } else {
        if (codeData.attempts >= 3) {
            outputElement.textContent = `Incorrect! ❌\nExpected: "${cleanedCorrectAnswer}" but got: "${cleanedUserCode}"`;
            outputElement.style.color = 'red';
            playSound('wrong'); // Play wrong sound
            setNextButtonColor(false); // Call the global function with 'false' for incorrect answer
            nextButton.style.display = 'block'; // Show the Next button after 3 attempts
        } else {
            outputElement.textContent = "Incorrect! ❌";
            outputElement.style.color = 'red';
            playSound('wrong'); // Play wrong sound
            setNextButtonColor(false); // Call the global function with 'false' for incorrect answer
            nextButton.style.display = 'none'; // Hide Next button until 3 attempts
        }
    }

    // Update the scoreboard
    updateScoreBoard();
}



// Function to run code based on language
async function runCode() {
    const code = editor.getValue();
    const outputElement = document.getElementById('output');
    const language = editor.getOption('mode');
    const runBtn = document.getElementById('run-btn');
    outputElement.textContent = ''; // Clear previous output
    outputElement.textContent = ''; // Clear previous output
    runBtn.classList.add('running');
    runBtn.textContent = 'Running🏃‍♀️';
    try {
        if (language === 'javascript') {
            // Redirect console.log output to output container
            const originalConsoleLog = console.log;
            const consoleLog = [];
            console.log = (message) => {
                consoleLog.push(message);
                outputElement.textContent = consoleLog.join('\n');
            };

            eval(code);
        } else if (language === 'python') {
            // Initialize Pyodide
            if (!pyodide) {
                pyodide = await loadPyodide({
                    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.22.0/full/",
                    stdin: window.prompt,
                    stdout: (text) => { outputElement.textContent += text; },
                    stderr: (text) => { outputElement.textContent += text; }
                });
            }

            // Execute Python code and capture output
            await pyodide.runPythonAsync(code);
        } else if (language === 'htmlmixed') {
            // Display HTML code in output element
            outputElement.innerHTML = code;
        } else if (language === 'css') {
            
            // Apply CSS styles to sample elements
            document.getElementById('lesson-text').innerHTML = '';  // Clear any existing content
            document.getElementById('output').innerHTML = `
                <div class="sample-1">Sample 1</div>
                <div class="sample-2">Sample 2</div>
                <div class="sample-3">Sample 3</div>
            `;

            const styleElement = document.createElement('style');
            styleElement.textContent = code;
            document.head.appendChild(styleElement);
        } else {
            outputElement.textContent = 'Running code in this language is not supported.';
        }
    } catch (error) {
        outputElement.textContent = `Error: ${error.message}`;
    } finally {
        setTimeout(() => {
            runBtn.textContent = 'Run Code';
            runBtn.classList.remove('running');
        }, 300); // Adjust the delay as needed
    }
}


//To Do
   //create a new type called exercise where it has dynamic questions and answers and a timer. user competes with another user
   // Scores from all types are added and and showned to the leader board




//iframe type

//YouTube: Replaces watch?v= with embed/ to convert the URL to an embed link
//Vimeo: Replaces vimeo.com with player.vimeo.com/video to convert to an embed link.
// Track the iframe element globally or within a scope accessible to the next button handler
let currentIframeElement = null;
function renderIframe(iframeData) {
    // Update the lesson title
    document.getElementById('lesson-title').textContent = iframeData.title;
    

    // Create and configure the iframe element
    const iframeElement = document.createElement('iframe');
    iframeElement.src = iframeData.url;
    iframeElement.width = '100%';
    iframeElement.height = '700px';
    iframeElement.style.border = 'none'; // Remove border for cleaner look

    // Add error handling
    iframeElement.addEventListener('error', () => {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'The content could not be loaded. Please check the URL or try again later.';
        document.getElementById('lesson-text').innerHTML = ''; // Clear previous content
        document.getElementById('lesson-text').appendChild(errorMessage);
    });

    // Clear previous content and append the iframe
    const lessonTextElement = document.getElementById('lesson-text');
    lessonTextElement.innerHTML = ''; // Clear previous content
    // Add paragraphs if present
    let paragraphHTML = '';
    if (iframeData.paragraphs && iframeData.paragraphs.length > 0) {
        paragraphHTML = iframeData.paragraphs.map(p => `<p>${p}</p>`).join('');
    }
    lessonTextElement.innerHTML = paragraphHTML; // Add paragraphs to the lesson text
    lessonTextElement.appendChild(iframeElement);

    // Store the iframe element globally
    currentIframeElement = iframeElement;

    // Update UI elements
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('drag-and-drop-container').style.display = 'none';
    document.getElementById('code-editor-container').style.display = 'none';
    document.getElementById('output-container').style.display = 'none';
    document.getElementById('next-btn').textContent = 'Next';
    document.getElementById('next-btn').onclick = () => {
        stopMedia(); // Stop any media playing before moving to the next lesson
        currentSequenceIndex++;
        showSubLesson();
    };
    document.getElementById('lesson-content').style.display = 'block';
    document.getElementById('next-btn').style.display = 'block';
    document.getElementById('feedback-message').textContent = ''; // Clear any previous feedback
    resetNextButton();
}

// Function to stop video playing
function stopMedia() {
    if (currentIframeElement) {
        // Stop iframe content by clearing src
        currentIframeElement.src = '';
        currentIframeElement = null;
    }

    // If there are video elements, stop them
    document.querySelectorAll('video').forEach(video => {
        video.pause(); // Pause video
        video.currentTime = 0; // Reset to start
    });
}

// video type
function renderVideo(video) {
    const videoElement = document.createElement('video');
    videoElement.controls = true;
  
    // Style the video element
    videoElement.style.maxWidth = '100%'; // Responsive width
    videoElement.style.maxHeight = '500px'; // Set a maximum height
    videoElement.style.width = 'auto'; // Maintain aspect ratio
    videoElement.style.height = 'auto'; // Maintain aspect ratio

    // Add multiple source elements for different formats
    const formats = [
        { url: video.url.mp4, type: 'video/mp4' },
        { url: video.url.webm, type: 'video/webm' },
        { url: video.url.ogv, type: 'video/ogg' }
    ];

    formats.forEach(format => {
        if (format.url) {
            const sourceElement = document.createElement('source');
            sourceElement.src = format.url;
            sourceElement.type = format.type;
            videoElement.appendChild(sourceElement);
        }
    });

    // Add event listener to handle the case when no supported format is found
    videoElement.addEventListener('error', () => {
        const lessonTextElement = document.getElementById('lesson-text');
        lessonTextElement.innerHTML = ''; // Clear previous content
        const fallbackMessage = document.createElement('p');
        fallbackMessage.textContent = 'Your browser does not support the video tag or the video format provided.';
        lessonTextElement.appendChild(fallbackMessage);
    });

    // Clear previous content and append video element
    const lessonTextElement = document.getElementById('lesson-text');
    lessonTextElement.innerHTML = ''; // Clear previous content
    lessonTextElement.appendChild(videoElement);

    // Update lesson title and other UI elements
    document.getElementById('lesson-title').textContent = video.title;
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('drag-and-drop-container').style.display = 'none';
    document.getElementById('code-editor-container').style.display = 'none';
    document.getElementById('output-container').style.display = 'none';
    document.getElementById('next-btn').textContent = 'Next';
    document.getElementById('next-btn').onclick = () => {
        currentSequenceIndex++;
        showSubLesson();
    };
    document.getElementById('lesson-content').style.display = 'block';
    document.getElementById('next-btn').style.display = 'block';
    document.getElementById('feedback-message').textContent = ''; // Clear feedback for video
    resetNextButton(); //reset next button color
}

// Function to render the drag-and-drop interface
let data = {
    items: [
        { id: 1, text: 'Item 1' },
        { id: 2, text: 'Item 2' },
        // Add more items as needed
    ],
    targets: [
        { id: 1, label: 'Target 1' },
        { id: 2, label: 'Target 2' },
        // Add more targets as needed
    ],
    question: 'Match the items with the correct targets.'
};

let correctMatches = {
    1: 1, // Item 1 should go to Target 1
    2: 2, // Item 2 should go to Target 2
    // Add more correct matches as needed
};

let currentTouchItem = null; // For tracking the item being touched on mobile
let placedItemsCount = 0; // Track the number of items placed

// Function to render the drag-and-drop interface
function renderDragAndDrop(data) {
    document.getElementById('lesson-title').textContent = data.question;

    // Set up draggable items
    const itemsContainer = document.getElementById('items-container');
    itemsContainer.innerHTML = '';
    data.items.forEach(item => {
        const div = document.createElement('div');
        div.id = `item-${item.id}`;
        div.className = 'draggable-item';
        div.draggable = true;
        div.ondragstart = drag;
        div.textContent = item.text;

        // Add touch event listeners for mobile
        div.addEventListener('touchstart', touchStart);
        div.addEventListener('touchend', touchEnd);

        itemsContainer.appendChild(div);
    });

    // Set up droppable targets
    const targetsContainer = document.getElementById('targets-container');
    targetsContainer.innerHTML = data.targets.map(target =>
        `<div id="target-${target.id}" class="droppable-target" ondrop="drop(event)" ondragover="allowDrop(event)">
            ${target.label}</div>`).join('');

    // Hide any previous video content
    document.getElementById('lesson-text').innerHTML = '';

    // Show drag-and-drop container and hide other elements
    document.getElementById('drag-and-drop-container').style.display = 'block';
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('code-editor-container').style.display = 'none';
    document.getElementById('lesson-image').style.display = 'none'; // clear existing image
    document.getElementById('output-container').style.display = 'none';
    // Clear any previous feedback message
    document.getElementById('feedback-message').textContent = '';

    // Reset placed items count
    placedItemsCount = 0;
}

// Function to handle the drag event
function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

// Function to allow dropping of elements
function allowDrop(event) {
    event.preventDefault();
}

// Function to handle the drop event
function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    const targetElement = event.target;

    if (targetElement.classList.contains('droppable-target') && targetElement.children.length === 0) {
        targetElement.appendChild(draggedElement);
        draggedElement.draggable = false; // Disable dragging after being placed
        removeTouchListeners(draggedElement); // Disable touch events after being placed
        placedItemsCount++; // Increment the count of placed items
    }

    // Check if all items are placed and validate if it's the last item
    if (placedItemsCount === Object.keys(correctMatches).length) {
        checkDragAndDropCompletion();
    }
}

// Function to check if the drag-and-drop completion is correct
function checkDragAndDropCompletion() {
    const targetsContainer = document.getElementById('targets-container');
    let allCorrect = true;
    let correctItemsCount = 0;
    let totalItems = Object.keys(correctMatches).length;

    // Clear previous feedback and background color
    document.querySelectorAll('.droppable-target').forEach(target => {
        target.style.backgroundColor = ''; // Reset background color
    });

    // Check each target for correctness
    document.querySelectorAll('.droppable-target').forEach(target => {
        const targetId = target.id.replace('target-', '');
        const targetItem = target.querySelector('.draggable-item');
        const targetItemId = targetItem ? targetItem.id.replace('item-', '') : null;

        if (correctMatches[targetItemId] && correctMatches[targetItemId] == targetId) {
            target.style.backgroundColor = 'lightgreen'; // Correct match
            correctItemsCount++;
        } else {
            target.style.backgroundColor = 'lightcoral'; // Incorrect match
            allCorrect = false;
        }
    });

    // Provide feedback message and update score
    const feedbackMessage = document.getElementById('feedback-message');
    if (correctItemsCount === totalItems) {
        feedbackMessage.textContent = 'Correct! You get 10 points. 🎉'; 
        feedbackMessage.style.color = 'green';
        playSound('correct');  // Play correct sound
        setNextButtonColor(true); // Call the global function with 'true' for correct answer
        currentScore += 10; // Award points for correct completion
    } else {
        feedbackMessage.textContent = 'Wrong! ❌ Items are matched incorrectly.';
        feedbackMessage.style.color = 'red';
        playSound('wrong');  // Play wrong sound
        setNextButtonColor(false); // Call the global function with 'true' for correct answer
    }

    // Update the scoreboard
    updateScoreBoard();

    // Show the next button
    document.getElementById('next-btn').style.display = 'block';
    
}

// Function to handle touch start event
function touchStart(event) {
    event.preventDefault();
    currentTouchItem = event.target;
}

// Function to handle touch end event
function touchEnd(event) {
    event.preventDefault();
    const touch = event.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.classList.contains('droppable-target') && element.children.length === 0) {
        element.appendChild(currentTouchItem);
        currentTouchItem.draggable = false; // Disable dragging after being placed
        removeTouchListeners(currentTouchItem); // Disable touch events after being placed
        placedItemsCount++; // Increment the count of placed items

        // Check if all items are placed and validate if it's the last item
        if (placedItemsCount === Object.keys(correctMatches).length) {
            checkDragAndDropCompletion();
        }
    }
}

// Function to remove touch event listeners from an item
function removeTouchListeners(item) {
    item.removeEventListener('touchstart', touchStart);
    item.removeEventListener('touchend', touchEnd);
}

// Function to update the scoreboard (example implementation)
function updateScoreBoard() {
    // Update your scoreboard logic here
    console.log(`Current Score: ${currentScore}`);
}

// Function to play sound based on result
function playSound(result) {
    const correctSound = new Audio('assets/right.mp3'); // Replace with your correct sound file
    const wrongSound = new Audio('assets/wrong.mp3');  

    if (result === 'correct') {
        correctSound.play();
    } else if (result === 'wrong') {
        wrongSound.play();
    } 
}
// Initialize the drag-and-drop interface
renderDragAndDrop(data);


//quiz type
function renderQuiz(quiz) {
    document.getElementById('lesson-title').textContent = quiz.question;
    const quizOptions = document.getElementById('quiz-options');
    quizOptions.innerHTML = quiz.options.map((option, index) =>
        `<button onclick="handleOptionClick(${index}, ${quiz.answer})">${option}</button>`).join('');
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('drag-and-drop-container').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';

    document.getElementById('code-editor-container').style.display = 'none';
    document.getElementById('output-container').style.display = 'none';
    
    document.getElementById('feedback-message').textContent = '';  // Clear any previous feedback
    document.getElementById('lesson-text').innerHTML = '';  // Clear any existing content


    
    
}
//Quiz Function to handle a user's answer to a quiz question
function handleOptionClick(selectedAnswer, correctAnswer) {
    // Get all the option buttons for the quiz
    const optionButtons = document.querySelectorAll('#quiz-options button');
    optionButtons.forEach((button, index) => {
        if (index === correctAnswer) {
            button.style.backgroundColor = 'lightgreen';  // Highlight the correct answer
        } else if (index === selectedAnswer) {
            button.style.backgroundColor = 'lightcoral';  // Highlight the selected (incorrect) answer
        }
        button.disabled = true;  // Disable all option buttons after an answer is selected
    });

    const feedbackMessage = document.getElementById('feedback-message');
    if (selectedAnswer === correctAnswer) {
        feedbackMessage.textContent = 'Correct answer! You get 10 points. 🎉';
        feedbackMessage.style.color = 'green';
        playSound('correct');  // Play correct sound
        currentScore += 10;  // Add points to the user's score
        correctAnswersInARow++;  // Increment the correct answers counter
        incorrectAnswersInARow = 0;  // Reset the incorrect answers counter
        setNextButtonColor(true); // Call the global function with 'true' for correct answer

        
        
        // Show a motivational message if 3 correct answers are in a row
        if (correctAnswersInARow === 3) {
            showMessage(getRandomMessage(positiveMessages), 'fade');
            correctAnswersInARow = 0;  // Reset the correct answers counter
        }
    } else {
        feedbackMessage.textContent = 'Incorrect answer!❌ The correct answer is highlighted.';
        feedbackMessage.style.color = 'red';
        playSound('wrong');  // Play wrong sound
        incorrectAnswersInARow++;  // Increment the incorrect answers counter
        correctAnswersInARow = 0;  // Reset the correct answers counter
        setNextButtonColor(false);  // Call the global function with 'false' for incorrect answer
        
        // Show an encouraging message if 3 incorrect answers are in a row
        if (incorrectAnswersInARow === 3) {
            showMessage(getRandomMessage(encouragingMessages), 'fade');
            incorrectAnswersInARow = 0;  // Reset the incorrect answers counter
        }
    }
    document.getElementById('code-editor-container').style.display = 'none';
    document.getElementById('output-container').style.display = 'none';
    // Show the next button after a short delay to ensure CSS applies
   document.getElementById('next-btn').style.display = 'block';
   
}

//Colors for isRight or isWrong
//Global Function to change color based on user answers
function setNextButtonColor(isCorrect) {
    const nextButton = document.getElementById('next-btn');
    
    if (isCorrect) {
        nextButton.style.backgroundColor = 'lightgreen';  // Set the background color to green for correct answers
        nextButton.style.color = '#000';  // Set text color for visibility
        nextButton.style.fontWeight = 'bold';
    } else {
        nextButton.style.backgroundColor = 'lightcoral';  // Set the background color to red for incorrect answers
        nextButton.style.color = '#000';  // Set text color for visibility
        nextButton.style.fontWeight = 'bold';  // Set font weight for visibility
        
    }
}

// Global Function to reset the next button color to its original state
function resetNextButton() {
    const nextButton = document.getElementById('next-btn');
    nextButton.style.backgroundColor = ''; // Reset to default color
}


// Function to mark the lesson as complete and update the UI
function completeLesson() {
    currentLevel = currentLesson.id + 1;  // Move to the next level
    const isLastLevel = currentLesson.id === lessons.length;  // Check if the current lesson is the last level
    updateUI(isLastLevel);  // Update the UI based on whether it's the last level
    
}

// Function to update the UI based on whether the user has completed all levels
function updateUI(isLastLevel) {
    document.getElementById('lesson-content').style.display = 'none';  // Hide the lesson content
    document.getElementById('next-btn').style.display = 'none';  // Hide the next button
    document.getElementById('scoreboard').style.display = 'block';  // Show the scoreboard
    document.getElementById('confetti-canvas').style.display = 'none';  // Hide the confetti canvas

    displayScoreboard(isLastLevel);  // Display the scoreboard
    showConfetti();  // Show confetti animation    
}
//end of all types



// Function to display the scoreboard with the user's points and a button to continue
function displayScoreboard(isLastLevel) {
    const scoreboard = document.getElementById('scoreboard');
    scoreboard.innerHTML = '';  // Clear any existing content

    // Create a container for the scoreboard content
    const scoreboardContent = document.createElement('div');
    scoreboardContent.className = 'scoreboard-content';

    // Create and append a trophy image
    const trophyImg = document.createElement('img');
    trophyImg.id = 'trophyImage'
    trophyImg.src = 'assets/cat.gif';  // Path to the trophy image
    scoreboardContent.appendChild(trophyImg);

    // Create and append a message indicating the lesson is completed
    const completedMessage = document.createElement('p');
    completedMessage.textContent = 'Lesson Completed!';
    completedMessage.id = 'lessonCompleteMessage'
    scoreboardContent.appendChild(completedMessage);

    // Create and append a label for points
    const pointsText = document.createElement('p');
    pointsText.textContent = 'Points:';
    pointsText.id = 'pointsLabel'
    scoreboardContent.appendChild(pointsText);

    // Create and append the total points earned by the user
    const totalPoints = document.createElement('p');
    totalPoints.id = 'totalScore'
    totalPoints.textContent = `${currentScore}`;
    scoreboardContent.appendChild(totalPoints);

    // Create and append a button to continue to the next level or go to the course library
    const continueBtn = document.createElement('button');
    continueBtn.textContent = isLastLevel ? 'Go to Course Library' : 'Continue to Next Level';
    continueBtn.id = 'continue-btn'
    continueBtn.onclick = () => {
        if (isLastLevel) {
            window.location.href = 'index.html';  // Redirect to the course library if it's the last level
        } else {
            document.getElementById('scoreboard').style.display = 'none';  // Hide the scoreboard
            document.getElementById('level-map').style.display = 'block';  // Show the level map
            generateLevelMap();  // Regenerate the level map
        }
    };
    scoreboardContent.appendChild(continueBtn);

    scoreboard.appendChild(scoreboardContent);  // Append the content to the scoreboard
    scoreboard.style.display = 'block';  // Show the scoreboard

    //change body bgc, and clear bg main bg color to reveal confetti
    document.getElementById('course-level-main').style.backgroundColor = 'none';
    document.getElementById('course-level-body').style.backgroundColor = '#fffafaff';

    // Show a completion popup if it's the last level
    if (isLastLevel) {
        showCompletionPopup();
    }
}


// Function to show a popup message indicating completion of all levels
function showCompletionPopup() {
    const popup = document.getElementById('popup-message');
    popup.innerHTML = '<p>Congratulations! You have completed all levels!</p>';  // Set the popup content
    popup.classList.add('zoom-in-out');  // Add an animation class for zoom-in and zoom-out effect
    popup.style.display = 'block';  // Show the popup
    setTimeout(() => {
        popup.style.display = 'none';  // Hide the popup after the animation
        popup.classList.remove('zoom-in-out');  // Remove the animation class
    }, 3000);  // Duration should match the CSS animation duration
    
}

// Function to show a message with a specified animation type
function showMessage(message, type) {
    const popup = document.getElementById('popup-message');
    const textElement = document.getElementById('popup-text');

    textElement.textContent = message;  // Set the message text

    // Remove any existing animation classes
    popup.classList.remove('fade-in-out', 'zoom-in-out');

    // Add the appropriate animation class based on the type
    if (type === 'fade') {
        popup.classList.add('fade-in-out');  // Add fade-in and fade-out animation
    }

    popup.style.display = 'block';  // Show the popup

    // Hide the popup after the animation ends
    setTimeout(() => {
        popup.style.display = 'none';  // Hide the popup
    }, 3000);  // Duration should match the animation duration
}

// Function to get a random message from an array of messages
function getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];  // Return a random message from the array
}

// Function to initialize and show the confetti animation
function showConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (canvas && typeof initConfetti === 'function') {
        canvas.style.display = 'block';  // Ensure the canvas is visible
        initConfetti();  // Call the function to start the confetti animation
    } else {
        console.error('Confetti function not found or canvas element missing');  // Log an error if the function or canvas is missing
    }
    // Play celebration music if it's the last level
    const celebrateSound = new Audio('assets/celebrate.mp3'); // Replace with your actual sound file path
    celebrateSound.play();
    
}

// Initial setup: Generate the level map and hide the scoreboard and confetti canvas
generateLevelMap();
document.getElementById('scoreboard').style.display = 'none';  // Hide the scoreboard at the start
document.getElementById('confetti-canvas').style.display = 'none';  // Hide the confetti canvas at the start

//test
//def is_palindrome(s):
//    # Convert string to lowercase to make the check case-insensitive
//    s = s.lower()
//     # Check if the string is equal to its reverse
//    return s == s[::-1]

//# Test cases
//print(is_palindrome('radar'))  # Expected: True
//print(is_palindrome('hello'))  # Expected: False


