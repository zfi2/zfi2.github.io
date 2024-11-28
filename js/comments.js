function loadCommentsSection() {
    const commentsSectionContainer = document.createElement('div');
    commentsSectionContainer.id = 'comments-section';
    document.body.appendChild(commentsSectionContainer);

    initializeComments(commentsSectionContainer);
}

// This function will initialize the comments section
function initializeComments(container) {
    container.innerHTML = `
        <h2>Comments</h2>

        <!-- Name and comment form at the top -->
        <form id="commentForm">
            <input type="text" id="name" placeholder="your name" required>
            <textarea id="comment" placeholder="your comment" required></textarea>
            <button type="submit">Submit Comment</button>
        </form>

        <!-- List of comments at the bottom -->
        <div id="comments-list"></div>

        <!-- Pagination controls at the bottom -->
        <div id="pagination">
            <button id="prev-page">previous</button>
            <span id="page-number">page 1</span>
            <button id="next-page">next</button>
        </div>
    `;

    initializeWebSocket();
}

function initializeWebSocket() {
    const socket = new WebSocket('wss://api.lain.ovh:41295', [], {
        headers: {
            'Origin': 'https://lain.ovh'
        }
    });

    let currentPage = 1;
    let totalComments = 0;
    let commentsPerPage = 5;

    socket.onopen = () => {
        // connected to websocket
        loadComments(currentPage);
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'comments') {
            displayComments(data.comments);
            totalComments = data.totalCount;
            updatePagination();
        } else if (data.type === 'new-comment') {
            displayNewComment(data.comment);
        } else if (data.type === 'error') {
            alert(data.message);
        }
    };

    function loadComments(page) {
        socket.send(JSON.stringify({
            type: 'pagination',
            page: page
        }));
    }

    function displayComments(comments) {
        const commentsList = document.getElementById('comments-list');
        commentsList.innerHTML = '';

        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment');
            commentDiv.innerHTML = `
                <strong>${comment.name}</strong> <br>
                <span>${comment.comment}</span> <br>
                <small>${new Date(comment.date).toLocaleString()}</small>
            `;
            commentsList.appendChild(commentDiv);
        });
    }

    function displayNewComment(comment) {
        const commentsList = document.getElementById('comments-list');
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');
        commentDiv.innerHTML = `
            <strong>${comment.name}</strong> <br>
            <span>${comment.comment}</span> <br>
            <small>${new Date(comment.date).toLocaleString()}</small>
        `;
        commentsList.insertBefore(commentDiv, commentsList.firstChild);
    }

    function updatePagination() {
        const totalPages = Math.ceil(totalComments / commentsPerPage);
        document.getElementById('page-number').textContent = `Page ${currentPage}`;
        document.getElementById('prev-page').disabled = currentPage === 1;
        document.getElementById('next-page').disabled = currentPage === totalPages;
    }

    document.getElementById('prev-page').onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            loadComments(currentPage);
        }
    };

    document.getElementById('next-page').onclick = () => {
        const totalPages = Math.ceil(totalComments / commentsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            loadComments(currentPage);
        }
    };

    document.getElementById('commentForm').onsubmit = (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const comment = document.getElementById('comment').value;

        if (name === "1a1n") {
            const password = prompt("Please enter the password to post as 1a1n:");

            socket.send(JSON.stringify({
                type: 'check-password',
                name: name,
                password: password,
                comment: comment
            }));
        } else {
            socket.send(JSON.stringify({
                type: 'post-comment',
                name: name,
                comment: comment
            }));
        }

        document.getElementById('name').value = '';
        document.getElementById('comment').value = '';
    };
}
