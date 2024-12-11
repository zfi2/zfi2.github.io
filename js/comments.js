class CommentSystem {
    constructor() {
        this.currentPage = 1;
        this.commentsPerPage = 5;
        this.elements = {
            container: null,
            navigation: null,
            commentsList: null,
            form: null,
            usernameInput: null,
            glitchEffect: null
        };
    }

    initialize() {
        this.createElements();
        this.attachEventListeners();
        this.checkServerAvailability();
    }

    createElements() {
        this.elements.container = document.createElement('div');
        this.elements.container.classList.add('comments-container');
        this.elements.container.style.opacity = '0';
        this.elements.container.style.transition = 'opacity 0.5s ease-in-out';

        const controlsSection = document.createElement('div');
        controlsSection.classList.add('controls-section');

        this.elements.form = document.createElement('form');
        this.elements.form.classList.add('comment-form');
        this.elements.form.innerHTML = `
            <input type="text" class="username-input" placeholder="Enter your username..." required />
            <textarea class="comment-input" placeholder="Enter your message..." required></textarea>
        `;
    
        this.elements.navigation = document.createElement('div');
        this.elements.navigation.classList.add('comments-navigation');
        this.elements.navigation.innerHTML = `
            <button type="button" class="nav-button prev-button">←</button>
            <button type="submit" class="submit-button">Send</button>
            <button type="button" class="nav-button next-button">→</button>
        `;

        this.elements.commentsList = document.createElement('div');
        this.elements.commentsList.classList.add('comments-list');

        this.elements.glitchEffect = document.createElement('div');
        this.elements.glitchEffect.classList.add('glitch-effect');
        this.elements.glitchEffect.style = "letter-spacing: 1em; font-size: 15px; text-align: center;";
        this.elements.glitchEffect.innerHTML = 'COMMENT SERVER UNREACHABLE';

        controlsSection.appendChild(this.elements.form);
        controlsSection.appendChild(this.elements.navigation);

        this.elements.container.appendChild(controlsSection);
        this.elements.container.appendChild(this.elements.commentsList);
        this.elements.container.appendChild(this.elements.glitchEffect);

        document.body.appendChild(this.elements.container);
    }

    attachEventListeners() {
        const prevButton = this.elements.navigation.querySelector('.prev-button');
        const nextButton = this.elements.navigation.querySelector('.next-button');

        prevButton.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadComments();
            }
        });

        nextButton.addEventListener('click', () => {
            this.currentPage++;
            this.loadComments();
        });

        this.elements.navigation.querySelector('.submit-button').addEventListener('click', async (e) => {
            e.preventDefault();
            const username = this.elements.form.querySelector('.username-input').value.trim();
            const content = this.elements.form.querySelector('.comment-input').value.trim();
        
            if (username && content) {
                const success = await this.postComment(username, content);
                if (success) {
                    this.elements.form.querySelector('.username-input').value = '';
                    this.elements.form.querySelector('.comment-input').value = '';
                    this.loadComments();
                } else {
                    alert('failed to submit comment, please try again.');
                }
            } else {
                alert('both username and comment are required.');
            }
        });
    }

    async checkServerAvailability() {
        try {
            const response = await fetch('http://65.21.130.122:31295/comments?page=1&limit=1');
            if (response.ok) {
                this.loadComments();
            } else {
                this.showGlitchEffect();
            }
        } catch (error) {
            console.error('server is unreachable:', error);
            this.showGlitchEffect();
        }
    }

    showGlitchEffect() {
        this.elements.glitchEffect.style.display = 'block';
        this.elements.container.classList.add('disabled');
    }

    hideGlitchEffect() {
        this.elements.glitchEffect.style.display = 'none';
        this.elements.container.classList.remove('disabled');
    }

    async fetchComments(page) {
        try {
            const response = await fetch(`http://65.21.130.122:31295/comments?page=${page}&limit=${this.commentsPerPage}`);
            if (!response.ok) {
                throw new Error(`error fetching comments: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('error fetching comments:', error);
            return { comments: [], totalPages: 0 };
        }
    }

    async postComment(username, content) {
        try {
            const response = await fetch('http://65.21.130.122:31295/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content, username }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 400) {
                    alert(errorData.error);
                    return false;
                } else if (response.status === 429) {
                    alert('you can only post one comment per day.');
                    return false;
                }
                throw new Error(`error posting comment: ${response.statusText}`);
            }
    
            return true;
        } catch (error) {
            console.error('error posting comment:', error);
            return false;
        }
    }

    renderComments(comments) {
        this.elements.commentsList.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-content">${comment.content}</div>
                <div class="comment-user">- ${comment.username}</div>
                <div class="comment-date">${new Date(comment.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }

    async loadComments() {
        const { comments, totalPages } = await this.fetchComments(this.currentPage);
        this.renderComments(comments);
        
        const prevButton = this.elements.navigation.querySelector('.prev-button');
        const nextButton = this.elements.navigation.querySelector('.next-button');
        
        prevButton.disabled = this.currentPage === 1;
        nextButton.disabled = this.currentPage === totalPages;
    }

    show() {
        this.elements.container.style.opacity = '1';
    }
}

window.commentSystem = new CommentSystem();
